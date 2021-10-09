/**
 * @jest-environment node
 */
  import ganache from 'ganache-core';
  import {
    setupWeb3 as setupWeb3Test,
    getAccounts,
    advanceTime
  } from './testing-utils/web3Util';
  import {
    getRandomString, 
    generateRandomNumber
  } from "./testing-utils/baseUtil";
  //import { deployENS } from '@ensdomains/mock';
  //import { getENS, getNamehash } from '../ens'
  import {
    BaseRegistrarImplementation,
    ENSRegistry,
    ETHRegistrarController,
    PublicResolver,
    ReverseRegistrar
  } from '../index.js';
  //import '../testing-utils/extendExpect'
  import Web3 from 'web3';
  import { ethers } from 'ethers';

  const ENVIRONMENTS = [/*'GANACHE_GUI',*/ 'GANACHE_CLI', 'GANACHE_CLI_MANUAL'];
  const ENV = ENVIRONMENTS[1];
  const secret = "0x0a6c9a9a231400596e50934c80c699fefc0d9969e32061da61f20d4214ac5f7d";

  let provider;
  let ethersProvider;
  let networkId;

  let baseRegistrarImplementation;
  let ensRegistry;
  let ethRegistrarController;
  let publicResolver;
  let reverseRegistrar;

  let nameForRegister;
 
  describe('Blockchain tests', () => {
    beforeAll(async () => {
      switch (ENV) {
        /*case 'GANACHE_CLI':
          provider = ganache.provider()
          await setupWeb3Test({ provider, Web3 })
          break*/
        case 'GANACHE_GUI':
          provider = new Web3.providers.HttpProvider('http://localhost:7545')
          await setupWeb3Test({ provider, Web3 })
          break
        case 'GANACHE_CLI_MANUAL':
          provider = new Web3.providers.HttpProvider('http://localhost:8545')
          await setupWeb3Test({ provider, Web3 })
          break
        default:
          const options = ENVIRONMENTS.join(' or ')
          throw new Error(`ENV not set properly, please pick from ${options}`)
      }

      const stringLength = generateRandomNumber(3, 20);
      nameForRegister = getRandomString(stringLength);
      const accounts = await getAccounts()
      expect(accounts.length).toBeGreaterThan(0)

      ethersProvider = new ethers.providers.Web3Provider(provider)
      const ethersSigner = ethersProvider.getSigner(accounts[0])
      networkId = await ethersSigner.getChainId()

      baseRegistrarImplementation = new BaseRegistrarImplementation({
        provider, 
        networkId,
        ethersSigner
      })

      ensRegistry = new ENSRegistry({
        provider, 
        networkId,
        ethersSigner
      })

      ethRegistrarController = new ETHRegistrarController({
        provider, 
        networkId,
        ethersSigner
      })

      publicResolver = new PublicResolver({
        provider, 
        networkId
      })
      
      reverseRegistrar = new ReverseRegistrar({
        provider, 
        networkId,
        ethersSigner
      })
    }, 1000000)


    describe('Test contract and Web3 setup', () => {
      test('accounts exist', async () => {
        expect(true).toBe(true)
        const accounts = await getAccounts()
        expect(accounts.length).toBeGreaterThan(0)
      })

      test('ethRegistrarController deployed', async() => {
        const accounts = await getAccounts()
        const ethRegistrarControllerOwner = await ethRegistrarController.owner()
        expect(ethRegistrarControllerOwner.owner).toBe(accounts[0])
      })
    })

    describe('ETHRegistrarController', () => {
      test('getAvailable returns true', async () => {
        const checkNameAvailable = await ethRegistrarController.checkNameAvailable(nameForRegister)
        expect(checkNameAvailable.available).toBe(true)
      })

      
      test('commit new name', async () => {
        const accounts = await getAccounts()
        const commitName = await ethRegistrarController.commitName(nameForRegister, accounts[0], secret)
        const getCommitmentTimestamp = await ethRegistrarController.getCommitmentTimestamp(nameForRegister, accounts[0], secret)
        expect(getCommitmentTimestamp.commitmentTimestamp.toNumber()).toBe((await ethersProvider.getBlock(commitName.tx.blockNumber)).timestamp);
      })

      test('buy new domain', async () => {
        advanceTime(60);
        const accounts = await getAccounts()
        const costName = await ethRegistrarController.costName(nameForRegister);
        const balanceBefore = await ethersProvider.getBalance(accounts[0]);
        await ethRegistrarController.buyNewDomain(nameForRegister, accounts[0], secret, costName.cost.toString(), 0);
        const balanceAfter = await ethersProvider.getBalance(accounts[0]);
        expect(balanceBefore.sub(costName.cost)).toStrictEqual(balanceAfter);
      })
    })

    describe('ReverseRegistrar', () => {
      test('set reverse name', async () => {
        const accounts = await getAccounts()
        const setReverseNameReturn = await reverseRegistrar.setReverseName(nameForRegister + ".theta", accounts[0], 0)
        expect(setReverseNameReturn.tx).not.toBe(null);
      })
    })

    describe('PublicResolver', () => {
      test('get address for domain', async () => {
        const accounts = await getAccounts()
        const getAddressReturn = await publicResolver.getAddrForDomain(nameForRegister + ".theta")
        expect(getAddressReturn.address).toBe(accounts[0])
      })

      test('get name for address', async () => {
        const accounts = await getAccounts()
        const nameForAddress = await publicResolver.getNameForAddress(accounts[0])
        expect(nameForAddress.name).toBe(nameForRegister + ".theta");
      })
    })

    describe('BaseRegistrarImplementation', () => {
      test('transfer name', async () => {
        const accounts = await getAccounts()
        const transferFromReturn = await baseRegistrarImplementation.transferFrom(
          accounts[0],
          accounts[1],
          nameForRegister, 
          0)
        expect(transferFromReturn.tx).not.toBe(null)
      })

      test('check current owner', async () => {
        const accounts = await getAccounts()
        const currentOwner = await baseRegistrarImplementation.ownerOf(nameForRegister)
        expect(currentOwner.address).toBe(accounts[1])

        // transfer does not update ENS without a call to reclaim.
        const domainOwner = await ensRegistry.getDomainOwner(nameForRegister + ".theta")
        expect(domainOwner.address).toBe(accounts[0])
      })

      test('reclaim ownership', async () => {
        const accounts = await getAccounts()
        const accountOne = accounts[1]
        const ethersSigner = ethersProvider.getSigner(accountOne)

        const baseRegistrarImplementationLocal = new BaseRegistrarImplementation({
          provider,
          networkId,
          ethersSigner
        })
        
        const transferFromReturn = await baseRegistrarImplementationLocal.reclaimOwnership(
          nameForRegister,
          accountOne,
          0)
        expect(transferFromReturn.tx).not.toBe(null)

        // check domain owner (it should be changed now)
        const domainOwner = await ensRegistry.getDomainOwner(nameForRegister + ".theta")
        expect(domainOwner.address).toBe(accountOne)
      })
    })
 })
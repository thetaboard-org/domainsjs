/**
 * @jest-environment node
 */
  import ganache from 'ganache-core';
  import {
    setupWeb3 as setupWeb3Test,
    getAccounts,
    advanceTime
  } from './testing-utils/web3Util';
  //import { deployENS } from '@ensdomains/mock';
  //import { getENS, getNamehash } from '../ens'
  import ETHRegistrarController from '../index.js';
  //import '../testing-utils/extendExpect'
  import Web3 from 'web3';
  import { ethers } from 'ethers';

  const ENVIRONMENTS = ['GANACHE_GUI', 'GANACHE_CLI', 'GANACHE_CLI_MANUAL'];
  const ENV = ENVIRONMENTS[2];
  const secret = "0x0a6c9a9a231400596e50934c80c699fefc0d9969e32061da61f20d4214ac5f7d";

  let provider
  let ethersProvider
  let ethRegistrarController
  let signer
 
  describe('Blockchain tests', () => {
    beforeAll(async () => {
      switch (ENV) {
        case 'GANACHE_CLI':
          provider = ganache.provider()
          await setupWeb3Test({ provider, Web3 })
          break
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

      const accounts = await getAccounts()
      expect(accounts.length).toBeGreaterThan(0)

      ethersProvider = new ethers.providers.Web3Provider(provider)
      const ethersSigner = ethersProvider.getSigner()
      signer = ethersSigner
      const networkId = 365
      ethRegistrarController = new ETHRegistrarController({ provider, networkId})
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
        const checkNameAvailable = await ethRegistrarController.checkNameAvailable("newname66")
        expect(checkNameAvailable.available).toBe(true)
      })

      
      test('commit new name', async () => {
        const accounts = await getAccounts()
        const commitName = await ethRegistrarController.commitName("newname66", accounts[0], secret)
        const getCommitmentTimestamp = await ethRegistrarController.getCommitmentTimestamp("newname66", accounts[0], secret)
        expect(getCommitmentTimestamp.commitmentTimestamp.toNumber()).toBe((await ethersProvider.getBlock(commitName.tx.blockNumber)).timestamp);
      })

      test('buy new domain', async () => {
        advanceTime(60);
        const accounts = await getAccounts()
        //console.log(accounts[0]);
        const costName = await ethRegistrarController.costName("newn");
        const balanceBefore = await ethersProvider.getBalance(accounts[0]);
        //console.log(balanceBefore.toString());
        console.log(costName)
        await ethRegistrarController.buyNewDomain("newname66", accounts[0], secret, costName.cost.toString(), 0);
        const balanceAfter = await ethersProvider.getBalance(accounts[0]);
        //console.log(balanceAfter.toString());
        expect(balanceBefore.sub(costName.cost)).toStrictEqual(balanceAfter);
      })
    })
 })
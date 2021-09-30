import { ethers } from 'ethers';
import { abi as ETHRegistrarControllerABI } from './contracts/ETHRegistrarController.json';

const Provider = ethers.providers.Provider;
const sha3 = require('web3-utils').sha3;

const emptyAddress = '0x0000000000000000000000000000000000000000';
const ETHRegistrarControllerAddress = new Map([
    [363, '0x0000000000000000000000000000000000000000'],
    [365, '0xA1A95C6d98e7a51904855C347f3E111FBe572772']
]);

function findETHRegistrarControllerAddress(networkId) {
    let ETHRegistrarControllerAddressLocal = ETHRegistrarControllerAddress.get(networkId);
    if (ETHRegistrarControllerAddressLocal) {
        return ETHRegistrarControllerAddressLocal;
    }
    return emptyAddress;
}

function getETHRegistrarController({ address, provider }) {
    return new ethers.Contract(address, ETHRegistrarControllerABI, provider);
}

export default class ETHRegistrarController {
    constructor(options) {
        const { provider, networkId } = options;
        let ethersProvider;
        if (Provider.isProvider(provider)) {
            //detect ethersProvider
            ethersProvider = provider;
        } else {
            ethersProvider = new ethers.providers.Web3Provider(provider);
        }
        this.provider = ethersProvider;
        this.signer = ethersProvider.getSigner();
        this.ethRegistrarController = getETHRegistrarController({
            address: findETHRegistrarControllerAddress(networkId),
            provider: ethersProvider
        });
        this.ethRegistrarControllerSigner = getETHRegistrarController({
            address: findETHRegistrarControllerAddress(networkId),
            provider: this.signer
        });
    }
  
    async checkNameAvailable(name) {
        try {
            const available = await this.ethRegistrarController.available(sha3(name));
            return {
                available: available
            };
        } catch (e) {
            console.log(`Error getting available for ETHRegistrarController`, e);
            return {
                available: false
            };
        }
    }

    async owner() {
        try {
            const owner = await this.ethRegistrarController.owner();
            return {
                owner: owner
            };
        } catch (e) {
            console.log(`Error getting owner for ETHRegistrarController`, e);
            return {
                owner: emptyAddress
            };
        }
    }

    async costName(_name) {
        try {
            var _cost = await this.ethRegistrarController.rentPrice(_name);
            return {
                cost: _cost
            };
        } catch (e) {
            console.log(`Error costName for ETHRegistrarController`, e);
            return {
                cost: null
            };
        }
    }

    async commitName(name, registrantAccount, secret) {
        try {
            var commitment = await this.ethRegistrarController.makeCommitment(name, registrantAccount, secret);
            var tx = await this.ethRegistrarControllerSigner.commit(commitment);
            return {
                tx: tx
            };
        } catch (e) {
            console.log(`Error commitName for ETHRegistrarController`, e);
            return {
                tx: null
            };
        }
    }

    async getCommitmentTimestamp(name, registrantAccount, secret) {
        try {
            var commitment = await this.ethRegistrarController.makeCommitment(name, registrantAccount, secret);
            var commitmentTimestamp = await this.ethRegistrarController.commitments(commitment);
            return {
                commitmentTimestamp: commitmentTimestamp
            };
        } catch (e) {
            console.log(`Error getCommitmentTimestamp for ETHRegistrarController`, e);
            return {
                commitmentTimestamp: 0
            };
        }
    }

    async buyNewDomain(_name, _registrantAccount, _secret, _value, _gasPrice) {
        try {
            var tx = await this.ethRegistrarControllerSigner.register(_name, _registrantAccount, _secret, {
                value: _value, 
                gasPrice: _gasPrice,
                from: _registrantAccount
            });
            return {
                tx: tx
            };
        } catch (e) {
            console.log(`Error buyNewDomain for ETHRegistrarController`, e);
            return {
                tx: null
            };
        }
    }
}

export {
    getETHRegistrarController
};
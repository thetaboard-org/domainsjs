import { ethers } from 'ethers';
import { abi as BaseRegistrarImplementationABI } from './contracts/BaseRegistrarImplementation.json';
import { abi as ENSRegistryABI } from './contracts/ENSRegistry.json';
import { abi as ETHRegistrarControllerABI } from './contracts/ETHRegistrarController.json';
import { abi as PublicResolverABI } from './contracts/PublicResolver.json';
import { abi as ReverseRegistrarABI } from './contracts/ReverseRegistrar.json';

const Provider = ethers.providers.Provider;
const sha3 = require('web3-utils').sha3;
const namehash = require('eth-ens-namehash');

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const BASE_REGISTRAR_IMPL_ADDRESS = new Map([
    [363, '0x0000000000000000000000000000000000000000'],
    [365, '0x6aB24eD1a4136fA1bC00b1367e0c911C528FE6b5'],
    [1337, '0x42AD14F243A790F98C934a958c140c1f6d453E9a']
]);
const ENS_REGISTRY_ADDRESS = new Map([
    [363, '0x0000000000000000000000000000000000000000'],
    [365, '0xC0CF8Cf458F411c4E192760123347B3776AE9aBc'],
    [1337, '0xAC0a2200c55F4215F5C3F4e8116a7b948C75F870']
]);
const ETH_REGISTRAR_CONTROLLER_ADDRESS = new Map([
    [363, '0x0000000000000000000000000000000000000000'],
    [365, '0x090aeFe8de61b7634DA1FbbB33e0cD81590dB932'],
    [1337, '0x45c20EaB9fc8BEB6920387Ac142ff9DFd48660c1']
]);
const PUBLIC_RESOLVER_ADDRESS = new Map([
    [363, '0x0000000000000000000000000000000000000000'],
    [365, '0x805f0f3b08A807B8F1f6BB1247665DE51885Ebd0'],
    [1337, '0xE714A91bADB081bE43BCF265Cd715e7Dc4eAf617']
]);
const REVERSE_REGISTRAR_ADDRESS = new Map([
    [363, '0x0000000000000000000000000000000000000000'],
    [365, '0xCfC0B6A22a38C0AE908683F2aa7e389602BE5C2B'],
    [1337, '0x256f4207239E543B8af70f6A5865086ED40BD009']
]);

function findBaseRegistrarImplAddress(networkId) {
    let baseRegistrarImplAddressLocal = BASE_REGISTRAR_IMPL_ADDRESS.get(networkId);
    if (baseRegistrarImplAddressLocal) {
        return baseRegistrarImplAddressLocal;
    }
    return EMPTY_ADDRESS;
}

function findENSRegistryAddress(networkId) {
    let ENSRegistryAddressLocal = ENS_REGISTRY_ADDRESS.get(networkId);
    if (ENSRegistryAddressLocal) {
        return ENSRegistryAddressLocal;
    }
    return EMPTY_ADDRESS;
}

function findETHRegistrarControllerAddress(networkId) {
    let ETHRegistrarControllerAddressLocal = ETH_REGISTRAR_CONTROLLER_ADDRESS.get(networkId);
    if (ETHRegistrarControllerAddressLocal) {
        return ETHRegistrarControllerAddressLocal;
    }
    return EMPTY_ADDRESS;
}

function findPublicResolverAddress(networkId) {
    let publicResolverAddressLocal = PUBLIC_RESOLVER_ADDRESS.get(networkId);
    if (publicResolverAddressLocal) {
        return publicResolverAddressLocal;
    }
    return EMPTY_ADDRESS;
}

function findReverseRegistrarAddress(networkId) {
    let reverseRegistrarLocal = REVERSE_REGISTRAR_ADDRESS.get(networkId);
    if (reverseRegistrarLocal) {
        return reverseRegistrarLocal;
    }
    return EMPTY_ADDRESS;
}

function getBaseRegistrarImplementation({ networkId, provider }) {
    return new ethers.Contract(findBaseRegistrarImplAddress(networkId), BaseRegistrarImplementationABI, provider);
}

function getENSRegistry({ networkId, provider }) {
    return new ethers.Contract(findENSRegistryAddress(networkId), ENSRegistryABI, provider);
}

function getETHRegistrarController({ networkId, provider }) {
    return new ethers.Contract(findETHRegistrarControllerAddress(networkId), ETHRegistrarControllerABI, provider);
}

function getPublicResolver({ networkId, provider }) {
    return new ethers.Contract(findPublicResolverAddress(networkId), PublicResolverABI, provider);
}

function getReverseRegistrar({ networkId, provider }) {
    return new ethers.Contract(findReverseRegistrarAddress(networkId), ReverseRegistrarABI, provider);
}


// class for BaseRegistrarImplementation
export class BaseRegistrarImplementation {
    constructor(options) {
        const { provider, networkId, ethersSigner} = options;
        let ethersProvider;
        if (Provider.isProvider(provider)) {
            //detect ethersProvider
            ethersProvider = provider;
        } else {
            ethersProvider = new ethers.providers.Web3Provider(provider);
        }
        this.provider = ethersProvider;
        this.signer = ethersSigner;
        this.baseRegistrarImplementation = getBaseRegistrarImplementation({
            networkId: networkId,
            provider: this.provider
        });
        this.baseRegistrarImplementationSigner = getBaseRegistrarImplementation({
            networkId: networkId,
            provider: this.signer
        });
    }

    // transfer domain from - to address
    async transferFrom(_addressFrom, _addressTo, _name, _gasPrice) {
        try {
            var _tx = await this.baseRegistrarImplementationSigner.transferFrom(
                _addressFrom,
                _addressTo,
                sha3(_name), {
                    gasPrice: _gasPrice,
                    from: _addressFrom
                }
            );
            return {
                tx: _tx
            };
        } catch (e) {
            console.log(`Error transferFrom for BaseRegistrarImplementation`, e);
            return {
                tx: null
            };
        }
    }

    // get owner for token with parameter name
    async ownerOf(_name) {
        try {
            var _addressOwner = await this.baseRegistrarImplementation['ownerOf(uint256)'](sha3(_name));
            return {
                address: _addressOwner
            };
        } catch (e) {
            console.log(`Error ownerOf for BaseRegistrarImplementation`, e);
            return {
                address: null
            };
        }
    }

    // reclaim ownership
    async reclaimOwnership(_name, _addressFrom, _gasPrice) {
        try {
            var _tx = await this.baseRegistrarImplementationSigner.reclaim(
                sha3(_name),
                _addressFrom , {
                    gasPrice: _gasPrice,
                    from: _addressFrom
                }
            );
            return {
                tx: _tx
            };
        } catch (e) {
            console.log(`Error reclaimOwnership for BaseRegistrarImplementation`, e);
            return {
                tx: null
            };
        }
    }
}

// class for BaseRegistrarImplementation
export class ENSRegistry {
    constructor(options) {
        const { provider, networkId, ethersSigner } = options;
        let ethersProvider;
        if (Provider.isProvider(provider)) {
            //detect ethersProvider
            ethersProvider = provider;
        } else {
            ethersProvider = new ethers.providers.Web3Provider(provider);
        }
        this.provider = ethersProvider;
        this.signer = ethersSigner;
        this.ensRegistry = getENSRegistry({
            networkId: networkId,
            provider: this.provider
        });
    }

    // get address for domain (full domain, for example newname.theta)
    async getDomainOwner(_domain) {
        try {
            var _nodehash = namehash.hash(_domain);
            var _address = await this.ensRegistry['owner(bytes32)'](_nodehash);
            return {
                address: _address
            };
        } catch (e) {
            console.log(`Error getDomainOwner for ENSRegistry`, e);
            return {
                address: null
            };
        }
    }
}

//class for ETHRegistrarController
export class ETHRegistrarController {
    constructor(options) {
        const { provider, networkId, ethersSigner} = options;
        let ethersProvider;
        if (Provider.isProvider(provider)) {
            //detect ethersProvider
            ethersProvider = provider;
        } else {
            ethersProvider = new ethers.providers.Web3Provider(provider);
        }
        this.provider = ethersProvider;
        this.signer = ethersSigner;
        this.ethRegistrarController = getETHRegistrarController({
            networkId: networkId,
            provider: ethersProvider
        });
        this.ethRegistrarControllerSigner = getETHRegistrarController({
            networkId: networkId,
            provider: this.signer
        });
        this.publicResolverAddress = findPublicResolverAddress(networkId);
    }
  
    // check is name available
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

    // check ethRegistrarController owner
    async owner() {
        try {
            const owner = await this.ethRegistrarController.owner();
            return {
                owner: owner
            };
        } catch (e) {
            console.log(`Error getting owner for ETHRegistrarController`, e);
            return {
                owner: EMPTY_ADDRESS
            };
        }
    }

    // check cost name for name
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

    // commit new name for registration
    async commitName(name, registrantAccount, secret) {
        try {
            var commitment = await this.ethRegistrarController.makeCommitmentWithConfig(name, 
                registrantAccount, 
                secret, 
                this.publicResolverAddress, 
                registrantAccount
            );
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

    // get timestamp from commit
    async getCommitmentTimestamp(name, registrantAccount, secret) {
        try {
            var commitment = await this.ethRegistrarController.makeCommitmentWithConfig(name, 
                registrantAccount, 
                secret,
                this.publicResolverAddress, 
                registrantAccount);
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

    // buy new domain
    async buyNewDomain(_name, _registrantAccount, _secret, _value, _gasPrice) {
        try {
            var tx = await this.ethRegistrarControllerSigner.registerWithConfig(_name, 
                _registrantAccount,
                _secret, 
                this.publicResolverAddress, 
                _registrantAccount, {
                    value: _value, 
                value: _value, 
                    value: _value, 
                    gasPrice: _gasPrice,
                    from: _registrantAccount
                }
            );
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

// class for PublicResolver
export class PublicResolver {
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
        this.publicResolver = getPublicResolver({
            networkId: networkId,
            provider: this.provider
        });
    }

    // get address for domain (full domain, for example newname.theta)
    async getAddrForDomain(_domain) {
        try {
            var _nodehash = namehash.hash(_domain);
            var _address = await this.publicResolver['addr(bytes32)'](_nodehash);
            return {
                address: _address
            };
        } catch (e) {
            console.log(`Error getAddrForDomain for PublicResolver`, e);
            return {
                address: null
            };
        }
    }

    // get domain for address
    async getNameForAddress(_address) {
        try {
            var _nodehash = namehash.hash(_address.slice(2).toLowerCase() + '.addr.reverse');
            var _name = await this.publicResolver['name(bytes32)'](_nodehash);
            return {
                name: _name
            };
        } catch (e) {
            console.log(`Error getNameForAddress for ReverseRegistrar`, e);
            return {
                name: null
            };
        }
    }
}

// class for ReverseRegistrar
export class ReverseRegistrar {
    constructor(options) {
        const { provider, networkId, ethersSigner } = options;
        let ethersProvider;
        if (Provider.isProvider(provider)) {
            //detect ethersProvider
            ethersProvider = provider;
        } else {
            ethersProvider = new ethers.providers.Web3Provider(provider);
        }
        this.provider = ethersProvider;
        this.signer = ethersSigner;
        this.reverseRegistrar = getReverseRegistrar({
            networkId: networkId,
            provider: this.provider
        });
        this.reverseRegistrarSigner = getReverseRegistrar({
            networkId: networkId,
            provider: this.signer
        });
    }

    // set name for reverseRegistrar
    async setReverseName(_name, _registrantAccount, _gasPrice) {
        try {
            var _tx = await this.reverseRegistrarSigner.setName(_name, {
                gasPrice: _gasPrice,
                from: _registrantAccount
            });
            return {
                tx: _tx
            };
        } catch (e) {
            console.log(`Error setReverseName for ReverseRegistrar`, e);
            return {
                tx: null
            };
        }
    }
}

export {
    getBaseRegistrarImplementation,
    getENSRegistry,
    getETHRegistrarController,
    getPublicResolver,
    getReverseRegistrar
};
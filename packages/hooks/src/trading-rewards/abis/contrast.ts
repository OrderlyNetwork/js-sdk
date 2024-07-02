import orderTokenAbi from './orderTokenAbi.json';
import contractABI from "./proxyLedgerAbi.json";
import omnichainLedgerV1ABI from "./OmnichainLedgerV1ABI.json";
import { ENVType } from "../useGetEnv";

export const orderlySepolia = "0x1cB262C876AE47A75Ec354D89766593839681C29";
export const arbitrumSepolia = "0x13b2d9219e4afb48c085e60a9cfacbc193a61f43";


/**
 * 1. orderlyTokenAdress :
 * ETH L1 :  ORDER Token
 * Other chains : ORDER Token
 * 2. orderlyContract : Ledger Test Address
 * 3. contract : Ledger Proxy
 */
interface ContractDataInterface {

    orderTokenAddress: string,
    orderTokenAddressOnEthereum: string;
    orderTokenAbi: Object,
    orderlyContract: string,
    orderlyContractABI: any,
    contract: string,
    contractABI: any,
    orderlyChainRpcUrl: string;
}

export function getOrderlyChainRPC(env: ENVType) {
    if (env === ENVType.prod) {
        return "https://rpc.orderly.network";
    }
    return "https://testnet-rpc.orderly.org";
}

export const getContractByEnv = (env: ENVType): ContractDataInterface => {
    const data = {
        orderTokenAddress: '',
        orderTokenAddressOnEthereum: '',
        orderTokenAbi,
        orderlyContract: orderlySepolia,
        orderlyContractABI: omnichainLedgerV1ABI,
        contract: arbitrumSepolia,
        contractABI: contractABI,
        orderlyChainRpcUrl: getOrderlyChainRPC(env),

    }

    // only order token address and orderlyContract split dev and qa, other use qa.
    if (env === ENVType.dev) {

        data.orderTokenAddress = '0xe2eB2df1CA9D90c8501049bAEEEf57f111782903';
        data.orderTokenAddressOnEthereum = '0x4cdE8A33afbb7f0F80841d9AE3Ada59fA1413F38';
        data.orderlyContract = '0x741a48F39683c345Ff37A86791537154869C77D4';
        data.contract = '0x0180107E72FB14a22a776913063b8a4081E9dc94';
    }
    if (env === ENVType.qa) {
        data.orderTokenAddress = '0x562874e9fcb02Ae6164781EcFb4AeAa169E99B18';
        data.orderTokenAddressOnEthereum = '0x8F7c2c827f0E9248CB5cf81fE732FDa62207F09c';
        data.orderlyContract = '0xf4EFdE916687eFBa271b1eDf436B206b285bc478';
        data.contract = '0xB20A18d8A53Ea23A5E8da32465De374f942693D7';

    }
    if (env === ENVType.staging) {
        data.orderTokenAddress = '0x2921a94509a17aebC1bB4d5bb35e3919Cd2a0BA8';
        data.orderTokenAddressOnEthereum = '0xF706d113f17bDb5d571Ce58A353360537110A357';
        data.orderlyContract = '0xfD81d496CeCEf7e18d3fca7F822bE770131f75F2';
        data.contract = '0x912196EB2583A2f0a18FaD632ee5dB65B8C93EEf';
    }
    if (env === ENVType.prod) {

        // todo prod contract info
    }

    return data;
}
import { API } from '@orderly.network/types';

declare namespace SwapType {
    type TokenInfo = API.TokenInfo & {
        swap_enable: Boolean;
        woofi_dex_precision: string;
        swap_enable: boolean;
    };
    type NetworkInfos = API.NetworkInfos & {
        woofi_dex_cross_chain_router: string;
        woofi_dex_depositor: string;
    };

    export interface ChainsNetworkInfo {
        testnet: API.NetworkInfos[];
        mainnet: API.NetworkInfos[];
    }
}

export { SwapType };

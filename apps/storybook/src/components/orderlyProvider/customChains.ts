import { AbstractTestnetChainInfo, AbstractTestnetTokenInfo } from "@kodiak-finance/orderly-types";


// test only evm chains
export const customChainsEvm: any = {
  testnet: [
    {
      dexs: [],
      token_infos: [],
      network_infos: {
        chain_id: 421614,
        name: "Arbitrum Sepolia",
        shortName: "Arbitrum Sepolia",
      },
    },
  ],
  mainnet: [
    {
      dexs: [],
      token_infos: [],
      network_infos: {
        chain_id: 42161,
        name: "Arbitrum",
        shortName: "Arbitrum",
      },
    },
  ],
};

// test only solana chains
export const customChainsSolana: any = {
  testnet: [
    {
      dexs: [],
      token_infos: [],
      network_infos: {
        chain_id: 901901901,
        name: "Solana Devnet",
        shortName: "Solana Devnet",
      },
    },
  ],
  mainnet: [
    {
      dexs: [],
      token_infos: [],
      network_infos: {
        chain_id: 900900900,
        name: "Solana",
        shortName: "Solana",
      },
    },
  ],
};

export const customChainsSolanaAndEvm: any = {
  testnet: [...customChainsSolana.testnet, ...customChainsEvm.testnet],
  mainnet: [...customChainsSolana.mainnet, ...customChainsEvm.mainnet],
};

export const customChainsAbstarct: any = {
  testnet: [
    {
      dexs: [],
      token_infos: [AbstractTestnetTokenInfo],
      network_infos: AbstractTestnetChainInfo,
    },
  ],
  mainnet: [
    {
      token_infos: [
        {
          chain_id: 2741,
          contract_address: "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
          decimals: 6,
          withdrawal_fee: 1,
          cross_chain_withdrawal_fee: 2,
          display_name: "USDC",
        },
      ],
      network_infos: {
        name: "Abstract",
        public_rpc_url: "https://api.mainnet.abs.xyz",
        chain_id: 2741,
        currency_symbol: "ETH",
        currency_decimal: 18,
        explorer_base_url: "https://mainnet.abscan.org",
        vault_address: "0xE80F2396A266e898FBbD251b89CFE65B3e41fD18",
      },
    },
  ],
};
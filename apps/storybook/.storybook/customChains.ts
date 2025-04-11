// test only evm chains
export const customChainsEvm: any = {
  testnet: [{
    dexs: [],
    token_infos: [],
    network_infos: {
      chain_id: 421614,
      name: "Arbitrum Sepolia",
      shortName: "Arbitrum Sepolia",
    },
  }],
  mainnet: [{
    dexs: [],
    token_infos: [],
    network_infos: {
      chain_id: 42161,
      name: "Arbitrum",
      shortName: "Arbitrum",
    },
  }],
}

// test only solana chains
export const customChainsSolana: any = {
  testnet: [{
    dexs: [],
    token_infos: [],
    network_infos: {
      chain_id: 901901901,
      name: "Solana Devnet",
      shortName: "Solana Devnet",
    },
  }],
  mainnet: [{
    dexs: [],
    token_infos: [],      
    network_infos: {
      chain_id:900900900,
      name: "Solana",
      shortName: "Solana",
    },
  }],
}

export const customChainsSolanaAndEvm: any = {
  testnet: [...customChainsSolana.testnet, ...customChainsEvm.testnet],
  mainnet: [...customChainsSolana.mainnet, ...customChainsEvm.mainnet],
}
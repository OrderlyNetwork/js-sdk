export const onboardOptions = {
  wallets: [
    //   injectedModule(), // metamask
    //   // walletConnect,
  ],
  chains: [],
  appMetadata: {
    name: "Orderly",
    icon: "/OrderlyLogo.png",
    description: "Orderly",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Trezor", url: "https://trezor.io/" },
      { name: "Walletconnect", url: "https://walletconnect.com/" },
      { name: "Ledger", url: "https://www.ledger.com/" },
    ],
    agreement: {
      version: "1.0.0",
      termsUrl: "https://www.blocknative.com/terms-conditions",
      privacyUrl: "https://www.blocknative.com/privacy-policy",
    },
    gettingStartedGuide: "https://blocknative.com",
    explore: "https://blocknative.com",
  },
  connect: {
    autoConnectLastWallet: true,
  },
};

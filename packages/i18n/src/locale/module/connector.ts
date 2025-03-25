export const connector = {
  "connector.testnet": "Testnet",
  "connector.mainnet": "Mainnet",

  "connector.disconnect": "Disconnect",
  "connector.connectWallet": "Connect wallet",
  "connector.signIn": "Sign in",
  "connector.signIn.description": "Confirm you are the owner of this wallet",
  "connector.enableTrading": "Enable trading",
  "connector.enableTrading.description":
    "Enable secure access to our API for lightning fast trading",

  "connector.switchNetwork": "Switch Network",
  "connector.wrongNetwork": "Wrong network",
  "connector.wrongNetwork.tooltip":
    "Please switch to a supported network to continue.",

  "connector.expired":
    "Your previous access has expired, you will receive a signature request to enable trading. Signing is free and will not send a transaction.",

  "connector.rememberMe": "Remember me",
  "connector.rememberMe.description":
    "Toggle this option to skip these steps next time you want to trade.",

  "connector.referralCode.placeholder": "Referral code (Optional)",
  "connector.referralCode.invalid":
    "The referral_code must be 4 to 10 characters long, only accept upper case roman characters and numbers",
  "connector.referralCode.notExist": "This referral code does not exist.",

  "connector.somethingWentWrong": "Something went wrong",
  "connector.userRejected": "User rejected the request.",

  "connector.walletConnected": "Wallet connected",
  "connector.networkSwitched": "Network switched",
  "connector.switchChain.failed": "Switch chain failed",

  "connector.trade.connectWallet.tooltip":
    "Please connect wallet before starting to trade",
  "connector.trade.signIn.tooltip": "Please sign in before starting to trade",
  "connector.trade.enableTrading.tooltip":
    "Please enable trading before starting to trade",

  "connector.setUp.connectWallet.tooltip":
    "Please connect wallet before set up",
  "connector.setUp.signIn.tooltip": "Please sign in before set up",
  "connector.setUp.enableTrading.tooltip":
    "Please enable trading before set up",

  "connector.ledger.signMessageFailed": "Sign Message Failed",
  "connector.ledger.signMessageFailed.description":
    "Are you using Ledger Wallet?",

  "connector.loginIn": "Login in",
  "connector.logout": "Log out",
  "connector.email": "Email",
  "connector.google": "Google",
  "connector.twitter": "X / Twitter",
  "connector.addEvmWallet": "Add Evm wallet",
  "connector.addSolanaWallet": "Add Solana wallet",
  "connector.termsOfUse":
    "By connecting your wallet, you acknowledge and agree to the <0>terms of use</0>.",
  "connector.supportedEvmChain": "Supported Evm chain",
  "connector.supportedSolanaChain": "Supported Solana chain",
};

export type Connector = typeof connector;

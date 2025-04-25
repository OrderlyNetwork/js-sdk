# wallet connector privy

The new wallet connector consists of three parts:
- Privy: Privy provides social login, featuring an injected wallet, EVM wallets, and Solana wallets.
- Wagmi: Wagmi offers connectivity for EVM wallets, such as MetaMask and WalletConnect.
- Solana: Solana provides connectivity for Solana wallets, such as Phantom and Ledger.

``` javascript
interface WalletConnectorPrivyProps{
  network: Network;
  customChains?: Chains;
  termsOfUse: string;
  privyConfig?: InitPrivy;
  wagmiConfig?: InitWagmi;
  solanaConfig?: InitSolana;
}
```

If privyConfig is not configured, the Privy connector will be disabled.

If wagmiConfig is not configured, the Wagmi connector will be disabled.

If solanaConfig is not configured, the Solana connector will be disabled.

At least one of privyConfig, wagmiConfig, or solanaConfig must be provided.

If customChains only includes a Solana chain, then Privy will only display the Solana injected wallet, and the Wagmi connector will be disabled.

If customChains only includes EVM chains, then Privy will only display the EVM injected wallet, and the Solana connector will be disabled.

eg:
``` javascript
<WalletConnectorPrivyProvider
      termsOfUse="https://learn.woo.org/legal/terms-of-use"
      network={Network.testnet}
      // customChains={customChains}
      privyConfig={{
        appid: "cm50h5kjc011111gdn7i8cd2k",
        config: {
          appearance: {
            theme: "dark",
            accentColor: "#181C23",
            logo: "/orderly-logo.svg",
          },
        },
      }}
      wagmiConfig={{
        connectors: [
          wagmiConnectors.injected(),
          wagmiConnectors.walletConnect({
            projectId: "93dba83e8d9915dc6a65ffd3ecfd19fd",
            showQrModal: true,
            storageOptions: {},
            metadata: {
              name: "Orderly Network",
              description: "Orderly Network",
              url: "https://orderly.network",
              icons: ["https://oss.orderly.network/static/sdk/chains.png"],
            },
          }),
        ],
      }}
      solanaConfig={{
        mainnetRpc: "",
        devnetRpc: "https://api.devnet.solana.com",
        wallets: wallets,
        onError: (error: WalletError, adapter?: Adapter) => {
          console.log("-- error", error, adapter);
        },
      }}
    >
      <OrderlyAppProvider
        configStore={configStore}
        appIcons={config.orderlyAppProvider.appIcons}
        restrictedInfo={config.orderlyAppProvider.restrictedInfo}
        // customChains={customChains}
      >
        {props.children}
      </OrderlyAppProvider>
    </WalletConnectorPrivyProvider>
```
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";
import { modal } from "@orderly.network/ui";

export const useAccountMenu = () => {
  const { disconnect, connect } = useWalletConnector();
  const { account, state } = useAccount();

  const onCrateAccount = async () => {
    modal.show(WalletConnectorModalId).then(
      (res) => console.log("return ::", res),
      (err) => console.log("error:::", err)
    );
  };

  const onCreateOrderlyKey = async () => {
    modal.show(WalletConnectorModalId).then(
      (res) => console.log("return ::", res),
      (err) => console.log("error:::", err)
    );
  };

  const onConnectWallet = async () => {
    const wallets = await connect();

    console.log("wallets::", wallets);
    if (Array.isArray(wallets) && wallets.length > 0) {
      // await account.connect(wallets[0]);
      onCrateAccount();
    }
  };
  return {
    address: state.address,
    accountState: state,
    onConnectWallet,
    onCrateAccount,
    onCreateOrderlyKey,
    onDisconnect: async () => {
      await disconnect({
        label: state.connectWallet?.name,
      });
      await account.disconnect();
    },
  };
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;

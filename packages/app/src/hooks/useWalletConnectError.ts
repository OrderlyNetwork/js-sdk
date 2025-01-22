import { useEventEmitter } from "@orderly.network/hooks";
import { useEffect } from "react";
import { modal, toast } from "@orderly.network/ui";

const LedgerWalletKey = "orderly:ledger-wallet";

export function useWalletConnectError() {
  const ee = useEventEmitter();


  useEffect(() => {
    ee.on('wallet:connect-error', (data) => {
      toast.error(data.message);

    })
    ee.on('wallet:sign-message-with-ledger-error', (data: { userAddress: string; message: string }) => {
      window.setTimeout(() => {

        modal.confirm({
          title: 'Sign Message Failed',
          content: "Are you using Ledger Wallet?",
          size: 'sm',
          onOk: async () => {
            console.log('-- use ledger', true);
            const info = window.localStorage.getItem(LedgerWalletKey);
            if (!info) {
              window.localStorage.setItem(LedgerWalletKey, JSON.stringify([data.userAddress]));
            } else {
              const ledgerWallet = JSON.parse(info ?? '[]');
              ledgerWallet.push(data.userAddress);
              window.localStorage.setItem(LedgerWalletKey, ledgerWallet);
            }
            // todo localstorage
            return Promise.resolve();
          },
          okLabel: 'OK',
          onCancel: async () => {
            toast.error(data.message);
            return Promise.resolve();
          },
          cancelLabel: 'No',

        }).then(res => {
          console.log('-- dialog res', res);
        });

      });

    })

  }, [ee])

  return {}
}
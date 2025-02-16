import { useEventEmitter } from "@orderly.network/hooks";
import { useEffect } from "react";
import { modal, toast } from "@orderly.network/ui";
import { LedgerWalletKey } from "@orderly.network/types";
import { useStorageLedgerAddress } from "@orderly.network/hooks"; 


export function useWalletConnectError() {
  const ee = useEventEmitter();
  const {setLedgerAddress} = useStorageLedgerAddress();  


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
            setLedgerAddress(data.userAddress);
    
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
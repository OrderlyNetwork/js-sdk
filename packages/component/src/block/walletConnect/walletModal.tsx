import { useContext } from "react";
import { modal, useModal } from "@orderly.network/ui";
// import { create } from "@/modal/modalHelper";
import { MEDIA_TABLET } from "@orderly.network/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/sheet";
import { toast } from "@/toast";
import { useAccount } from "@orderly.network/hooks";
import { useCallback } from "react";
import { WalletConnect, WalletConnectProps } from "./walletConnect";
import { Logo } from "@/logo";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/dialog";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@orderly.network/ui-connector";

const useWalletConnect = () => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  // get account status and handle sign in and enable trading
  const { account, createOrderlyKey, createAccount } = useAccount();

  const onSignIn = useCallback(() => {
    return createAccount().catch((err: Error) => {
      reject();
      toast.error(err.message);
      hide();
    });
  }, [account]);

  const onComplete = useCallback(() => {
    toast.success("Wallet connected");
    resolve();
    hide();
  }, []);

  return {
    visible,
    hide,
    resolve,
    reject,
    onOpenChange,
    onSignIn,
    onComplete,
    createOrderlyKey,
  };
};

export const WalletConnectSheet = modal.create<WalletConnectProps>((props) => {
  // const { visible, hide, resolve, reject, onOpenChange } = useModal();
  // // get account status and handle sign in and enable trading
  // const { account, createOrderlyKey, createAccount } = useAccount();
  // // @ts-ignore
  // const { logoUrl } = useContext(OrderlyContext);

  // const onSignIn = useCallback(() => {
  //   return createAccount().catch((err: Error) => {
  //     reject();
  //     toast.error(err.message);
  //     hide();
  //   });
  // }, [account]);

  // const onComplete = useCallback(() => {
  //   toast.success("Wallet connected");
  //   resolve();
  //   hide();
  // }, []);

  const {
    visible,
    hide,
    resolve,
    reject,
    onOpenChange,
    onSignIn,
    onComplete,
    createOrderlyKey,
  } = useWalletConnect();

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader leading={<Logo />}>
          <SheetTitle>Connect wallet</SheetTitle>
        </SheetHeader>
        <WalletConnect
          onEnableTrading={createOrderlyKey}
          onSignIn={onSignIn}
          onComplete={onComplete}
          {...props}
        />
      </SheetContent>
    </Sheet>
  );
});

export const WalletConnectDialog = modal.create<WalletConnectProps>((props) => {
  const {
    visible,
    hide,
    resolve,
    reject,
    onOpenChange,
    onSignIn,
    onComplete,
    createOrderlyKey,
  } = useWalletConnect();

  const _onOpenChange = useCallback((open: boolean) => {
    // console.log(open);
    if (!open) reject("cancel");
    onOpenChange(open);
  }, []);

  return (
    <Dialog open={visible} onOpenChange={_onOpenChange}>
      <DialogContent
        maxWidth={"sm"}
        closable
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="orderly-bg-base-800 desktop:orderly-max-w-[400px] orderly-px-[24px] orderly-py-6"
      >
        <DialogHeader>
          <DialogTitle>Connect wallet</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <WalletConnect
            onEnableTrading={createOrderlyKey}
            onSignIn={onSignIn}
            onComplete={onComplete}
            {...props}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
});

export const showAccountConnectorModal = async (props: WalletConnectProps) => {
  const matches = window.matchMedia(MEDIA_TABLET).matches;
  if (matches) {
    // return await modal.show(WalletConnectSheet, props);
    await modal.show(WalletConnectorSheetId, props);
  } else {
    return await modal.show(WalletConnectorModalId, props);
  }
};

import { FC, PropsWithChildren, createContext, useCallback } from "react";
import {
  useAccountInstance,
  useLocalStorage,
  useWalletSubscription,
  useSettleSubscription,
  useEventEmitter,
  useMediaQuery,
} from "@orderly.network/hooks";
import { capitalizeString } from "@orderly.network/utils";
import { MEDIA_TABLET } from "@orderly.network/types";

import { modal, toast } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  DepositAndWithdrawWithSheetId,
} from "@orderly.network/ui-transfer";

export interface AssetsContextState {
  onDeposit: () => Promise<any>;
  onWithdraw: () => Promise<any>;
  onSettle: () => Promise<any>;
  // getBalance: (token: string) => Promise<any>;
  visible: boolean;
  toggleVisible: () => void;
}

export const AssetsContext = createContext<AssetsContextState>(
  {} as AssetsContextState
);

export const AssetsProvider: FC<PropsWithChildren> = (props) => {
  const account = useAccountInstance();
  const matches = useMediaQuery(MEDIA_TABLET);

  const openDepositAndWithdraw = useCallback(
    async (viewName: "deposit" | "withdraw") => {
      let result;
      // result = await modal.show("DepositAndWithdrawWithDialogId", {
      //   activeTab: viewName,
      // });
      // result = await modal.show(DepositAndWithdrawWithDialogId, {
      //   activeTab: viewName,
      // });
      if (matches) {
        result = await modal.show(DepositAndWithdrawWithSheetId, {
          activeTab: viewName,
        });
      } else {
        result = await modal.show(DepositAndWithdrawWithDialogId, {
          activeTab: viewName,
        });
      }

      return result;
    },
    [matches]
  );

  const onDeposit = useCallback(async () => {
    return openDepositAndWithdraw("deposit");
  }, [matches]);

  const ee = useEventEmitter();

  const onWithdraw = useCallback(async () => {
    return openDepositAndWithdraw("withdraw");
  }, [matches]);

  const onSettle = useCallback(async () => {
    return account
      .settle()
      .catch((e) => {
        if (e.code == -1104) {
          toast.error(
            "Settlement is only allowed once every 10 minutes. Please try again later."
          );
          return Promise.reject(e);
        }
      })
      .then((res) => {
        toast.success("Settlement requested");
        return Promise.resolve(res);
      });
  }, []);

  const [visible, setVisible] = useLocalStorage<boolean>(
    "orderly_assets_visible",
    true
  );

  const toggleVisible = useCallback(() => {
    // @ts-ignore
    setVisible((visible: boolean) => {
      return !visible;
    });
  }, [visible]);

  useWalletSubscription({
    onMessage: (data: any) => {
      //
      const { side, transStatus } = data;

      if (transStatus === "COMPLETED") {
        let msg = `${capitalizeString(side)} completed`;
        toast.success(msg);
      } else if (transStatus === "FAILED") {
        let msg = `${capitalizeString(side)} failed`;
        toast.error(msg);
      }

      ee.emit("wallet:changed", data);
    },
  });

  useSettleSubscription({
    onMessage: (data: any) => {
      const { status } = data;

      // console.log("settle ws: ", data);

      switch (status) {
        case "COMPLETED":
          toast.success("Settlement completed");
          break;
        case "FAILED":
          toast.error("Settlement failed");
          break;
        default:
          break;
      }
    },
  });

  return (
    <AssetsContext.Provider
      value={{
        onDeposit,
        onWithdraw,
        onSettle,
        visible,
        toggleVisible,
        // getBalance,
      }}
    >
      {props.children}
    </AssetsContext.Provider>
  );
};

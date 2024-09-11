// import {
//   useAccountInstance,
//   useEventEmitter,
//   useLocalStorage,
//   useMediaQuery,
//   useSettleSubscription,
//   useWalletSubscription,
// } from "@orderly.network/hooks";
// import { MEDIA_TABLET } from "@orderly.network/types";
// import { modal, toast } from "@orderly.network/ui";
// import { capitalizeString } from "@orderly.network/utils";
// import { useCallback } from "react";
// import { DepositAndWithdrawWithSheetId, DepositAndWithdrawWithDialogId } from "@orderly.network/ui-transfer";

// hook
export const useAssetViewScript = () => {
//   const account = useAccountInstance();
//   const matches = useMediaQuery(MEDIA_TABLET);

//   const openDepositAndWithdraw = useCallback(
//     async (viewName: "deposit" | "withdraw") => {
//       let result;
//       if (matches) {
//         result = await modal.show(DepositAndWithdrawWithSheetId, {
//           activeTab: viewName,
//         });
//       } else {
//         result = await modal.show(DepositAndWithdrawWithDialogId, {
//           activeTab: viewName,
//         });
//       }

//       return result;
//     },
//     [matches]
//   );

//   const onDeposit = useCallback(async () => {
//     return openDepositAndWithdraw("deposit");
//   }, [matches]);

//   const ee = useEventEmitter();

//   const onWithdraw = useCallback(async () => {
//     return openDepositAndWithdraw("withdraw");
//   }, [matches]);

//   const onSettle = useCallback(async () => {
//     return account
//       .settle()
//       .catch((e) => {
//         if (e.code == -1104) {
//           toast.error(
//             "Settlement is only allowed once every 10 minutes. Please try again later."
//           );
//           return Promise.reject(e);
//         }
//       })
//       .then((res) => {
//         toast.success("Settlement requested");
//         return Promise.resolve(res);
//       });
//   }, []);

//   const [visible, setVisible] = useLocalStorage<boolean>(
//     "orderly_assets_visible",
//     true
//   );

//   const toggleVisible = useCallback(() => {
//     // @ts-ignore
//     setVisible((visible: boolean) => {
//       return !visible;
//     });
//   }, [visible]);

//   useWalletSubscription({
//     onMessage: (data: any) => {
//       //
//       const { side, transStatus } = data;

//       if (transStatus === "COMPLETED") {
//         let msg = `${capitalizeString(side)} completed`;
//         toast.success(msg);
//       } else if (transStatus === "FAILED") {
//         let msg = `${capitalizeString(side)} failed`;
//         toast.error(msg);
//       }

//       ee.emit("wallet:changed", data);
//     },
//   });

//   useSettleSubscription({
//     onMessage: (data: any) => {
//       const { status } = data;

//       // console.log("settle ws: ", data);

//       switch (status) {
//         case "COMPLETED":
//           toast.success("Settlement completed");
//           break;
//         case "FAILED":
//           toast.error("Settlement failed");
//           break;
//         default:
//           break;
//       }
//     },
//   });
  return {
    // onDeposit,
    // onWithdraw,
    // onSettle,
    // visible,
    // toggleVisible,
  };
};

export type AssetViewState = ReturnType<typeof useAssetViewScript>;

import { ExchangeStatusEnum, SystemStateEnum } from "@orderly.network/types";

import { getAppState } from "./services/appState";

// app system State , loading, dataError,netError,
// platform state
export const useAppState = () => {
  const appState = getAppState();
  return {};
  // return useObservable<{
  //   systemState: SystemStateEnum;
  //   exchangeState: ExchangeStatusEnum;
  // }>(
  //   () =>
  //     merge(appState.exchangeState$, appState.systemState$).pipe(
  //       map((data) => {
  //         // console.log(data);
  //         return {
  //           systemState: SystemStateEnum.Ready,
  //           exchangeState: ExchangeStatusEnum.Normal,
  //         };
  //       })
  //     ),
  //   {
  //     systemState: appState.systemState$.value,
  //     exchangeState: appState.exchangeState$.value,
  //   }
  // );
};

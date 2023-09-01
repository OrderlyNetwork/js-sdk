import { ExchangeStatusEnum, SystemStateEnum } from "@orderly.network/types";
import { merge } from "rxjs";
import { map } from "rxjs/operators";
import { useObservable } from "rxjs-hooks";
import { getAppState } from "./services/appState";

// app system State , loading, dataError,netError,
// platform state
export const useAppState = () => {
  const appState = getAppState();
  return useObservable<{
    systemState: SystemStateEnum;
    exchangeState: ExchangeStatusEnum;
  }>(
    () =>
      merge(appState.exchangeState$, appState.systemState$).pipe(
        map((data) => {
          // console.log(data);
          return {
            systemState: SystemStateEnum.Ready,
            exchangeState: ExchangeStatusEnum.Normal,
          };
        })
      ),
    {
      systemState: appState.systemState$.value,
      exchangeState: appState.exchangeState$.value,
    }
  );
};

import {
  useLeverage,
  useLocalStorage,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import { useCollateral, useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";

export type AccountSummaryType =
  | "totalValue"
  | "freeCollateral"
  | "unrealPnL"
  | "currentLeverage"
  | "maxLeverage";

export const useTotalValueBuilderScript = () => {
  const [keys, setKeys] = useLocalStorage<string[]>("accountSummaryTypes", [
    "totalValue",
  ]);

  const { freeCollateral, totalValue } = useCollateral({
    dp: 2,
  });

  const { state } = useAccount();

  const [visible, setVisible] = useLocalStorage("orderly_assets_visible", true);

  const [{ aggregated, totalUnrealizedROI }] = usePositionStream();
  const { wrongNetwork } = useAppContext();

  const { currentLeverage } = useMarginRatio();

  const [maxLeverage] = useLeverage();

  const onToggleItemByKey = (key: string) => {
    if (keys.includes(key)) {
      setKeys(keys.filter((k: string) => k !== key));
    } else {
      setKeys([...keys, key]);
    }
  };

  const onKeyToTop = (key: string) => {
    if (!keys.includes(key)) {
      setKeys([key, ...keys]);
      return;
    }

    setKeys([key, ...keys.filter((k: string) => k !== key)]);
  };

  const unavailable =
    wrongNetwork || state.status < AccountStatusEnum.EnableTrading;

  return {
    totalValue: unavailable ? null : totalValue,
    freeCollateral: unavailable ? null : freeCollateral,
    maxLeverage: unavailable ? null : maxLeverage,
    currentLeverage: unavailable ? null : currentLeverage,
    unrealPnL: unavailable ? null : aggregated?.total_unreal_pnl,
    unrealized_pnl_ROI: unavailable ? null : totalUnrealizedROI,
    // type,
    keys,
    // onTypeChange,
    visible,
    wrongNetwork,
    onToggleItemByKey,
    onKeyToTop,
    onToggleVisibility: () => setVisible(!visible),
  };
};

export type UseTotalValueBuilderScript = ReturnType<
  typeof useTotalValueBuilderScript
>;

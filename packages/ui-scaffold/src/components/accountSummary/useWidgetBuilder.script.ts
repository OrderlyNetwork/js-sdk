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
  const [type, setType] = useLocalStorage<AccountSummaryType>(
    "accountSummaryType",
    "totalValue"
  );
  const { freeCollateral, totalValue } = useCollateral({
    dp: 2,
  });

  const { state } = useAccount();

  const [visible, setVisible] = useLocalStorage("orderly_assets_visible", true);

  const [{ aggregated, totalUnrealizedROI }] = usePositionStream();
  const { wrongNetwork } = useAppContext();

  const { currentLeverage } = useMarginRatio();

  const [maxLeverage] = useLeverage();

  const onTypeChange = (type: AccountSummaryType) => {
    setType(type);
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
    type,
    onTypeChange,
    visible,
    wrongNetwork,
    onToggleVisibility: () => setVisible(!visible),
  };
};

export type UseTotalValueBuilderScript = ReturnType<
  typeof useTotalValueBuilderScript
>;

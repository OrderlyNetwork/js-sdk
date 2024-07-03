import {
  useLeverage,
  useLocalStorage,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import { useCollateral } from "@orderly.network/hooks";

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
  const { totalCollateral, freeCollateral, totalValue, availableBalance } =
    useCollateral({
      dp: 2,
    });

  const [{ aggregated, totalUnrealizedROI }] = usePositionStream();

  const { currentLeverage } = useMarginRatio();

  const [maxLeverage] = useLeverage();

  const onTypeChange = (type: AccountSummaryType) => {
    setType(type);
  };

  return {
    totalValue,
    freeCollateral,
    maxLeverage,
    currentLeverage,
    unrealPnL: aggregated?.unrealPnL ?? 0,
    unrealized_pnl_ROI: totalUnrealizedROI,
    type,
    onTypeChange,
    // visible?: boolean;
    // onToggleVisibility?: () => void;
  };
};

export type UseTotalValueBuilderScript = ReturnType<
  typeof useTotalValueBuilderScript
>;

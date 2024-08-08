import {
  useLeverage,
  useLocalStorage,
  useMarginRatio,
  usePositionStream,
} from "@orderly.network/hooks";
import { useCollateral } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";

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
  const { freeCollateral, totalValue, availableBalance } = useCollateral({
    dp: 2,
  });

  const [visible, setVisible] = useLocalStorage("orderly_assets_visible", true);

  const [{ aggregated, totalUnrealizedROI }] = usePositionStream();
  const { wrongNetwork } = useAppContext();

  const { currentLeverage } = useMarginRatio();

  const [maxLeverage] = useLeverage();

  const onTypeChange = (type: AccountSummaryType) => {
    setType(type);
  };

  return {
    totalValue: wrongNetwork ? null : totalValue,
    freeCollateral: wrongNetwork ? null : freeCollateral,
    maxLeverage: wrongNetwork ? null : maxLeverage,
    currentLeverage: wrongNetwork ? null : currentLeverage,
    unrealPnL: wrongNetwork ? null : aggregated?.unrealPnL,
    unrealized_pnl_ROI: wrongNetwork ? null : totalUnrealizedROI,
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

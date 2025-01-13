import { modal } from "@orderly.network/ui";
import { useTradingLocalStorage } from "../../../../provider/useTradingLocalStorage";
import { PortfolioSheetWidget } from "../../portfolioSheet";
import { useTradingPageContext } from "../../../../provider/context";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import {
  useAccount,
  useCollateral,
  useMarginRatio,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

export const useBalanceScript = () => {
  const { bottomSheetLeading } = useTradingPageContext();

  const { hideAssets, setHideAssets } = useTradingLocalStorage();
  const { wrongNetwork } = useAppContext();
  const { state } = useAccount();

  const { currentLeverage } = useMarginRatio();
  const { totalValue } = useCollateral();
  const isEnableTrading =
    state.status >= AccountStatusEnum.EnableTrading ||
    state.status === AccountStatusEnum.EnableTradingWithoutConnected;

  const onShowPortfolioSheet = () => {
    if (isEnableTrading) {
      modal.sheet({
        title: "Asset & Margin",
        leading: bottomSheetLeading,
        content: <PortfolioSheetWidget />,
      });
    }
  };
  const total = useDataTap(totalValue);

  return {
    currentLeverage,
    total,
    hideAssets,
    setHideAssets,
    onShowPortfolioSheet,
    wrongNetwork,
    isEnableTrading,
  };
};

export type BalanceState = ReturnType<typeof useBalanceScript>;

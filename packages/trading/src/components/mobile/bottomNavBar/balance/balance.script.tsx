import { modal } from "@orderly.network/ui";
import { useTradingLocalStorage } from "../../../../provider/useTradingLocalStorage";
import { PortfolioSheetWidget } from "../../portfolioSheet";
import { useTradingPageContext } from "../../../../provider/context";
import { useAppContext } from "@orderly.network/react-app";
import { useCollateral, useMarginRatio } from "@orderly.network/hooks";

export const useBalanceScript = () => {
  const { bottomSheetLeading } =
    useTradingPageContext();

  const { hideAssets, setHideAssets } = useTradingLocalStorage();
  const { wrongNetwork } = useAppContext();

  const { currentLeverage } = useMarginRatio();
  const { totalValue } = useCollateral();

  const onShowPortfolioSheet = () => {
    modal.sheet({
      title: "Asset & Margin",
      leading: bottomSheetLeading,
      content: <PortfolioSheetWidget />,
    });
  };
  return {
    currentLeverage,
    total: totalValue,
    hideAssets, setHideAssets,
    onShowPortfolioSheet,
    wrongNetwork,
  };
};

export type BalanceState = ReturnType<typeof useBalanceScript>;

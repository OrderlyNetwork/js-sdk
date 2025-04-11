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
import { useTranslation } from "@orderly.network/i18n";

export const useBalanceScript = () => {
  const { t } = useTranslation();
  const { bottomSheetLeading } = useTradingPageContext();
  const { hideAssets, setHideAssets } = useTradingLocalStorage();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const { state } = useAccount();

  const { currentLeverage } = useMarginRatio();
  const { totalValue } = useCollateral();

  const canTrade =
    !wrongNetwork &&
    !disabledConnect &&
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected);

  const onShowPortfolioSheet = () => {
    if (canTrade) {
      modal.sheet({
        title: t("trading.asset&Margin"),
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
    canTrade,
  };
};

export type BalanceState = ReturnType<typeof useBalanceScript>;

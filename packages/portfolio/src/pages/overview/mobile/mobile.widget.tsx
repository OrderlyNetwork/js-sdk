import React from "react";
import { ENVType, useGetEnv } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { useAppContext } from "@kodiak-finance/orderly-react-app";
import { Flex } from "@kodiak-finance/orderly-ui";
import { DepositStatusWidget } from "@kodiak-finance/orderly-ui-transfer";
import { useLayoutContext } from "../../../layout/context";
import { useAssetScript } from "../assets";
import { PortfolioChartsMobileWidget } from "../portfolioChartsMobile";
import { AccountStatusMobile } from "./accountStatus.ui.mobile";
import { AffiliateCardMobile } from "./affiliateCard.ui.mobile";
import { PortfolioHandleMobile } from "./portfolioHandle.ui.mobile";
import { PortfolioValueMobile } from "./portfolioVaule.ui.mobile";
import { SettingRouterMobile } from "./settingRouter.ui.mobile";
import { TraderCardMobile } from "./traderCard.ui.mobile";
// import { TradingRewardsCardMobile } from "./tradingRewardsCard.ui.mobile";
import { useRewardsDataScript } from "./useRewardsData.script";

export const MobileOverview: React.FC = () => {
  const {
    canTrade,
    onWithdraw,
    onDeposit,
    portfolioValue,
    unrealPnL,
    unrealROI,
    visible,
    namespace,
    toggleVisible,
    onTransfer,
    isMainAccount,
    hasSubAccount,
  } = useAssetScript();
  const { t } = useTranslation();
  const rewardsData = useRewardsDataScript();
  const layoutContext = useLayoutContext();
  const { onRouteChange } = useAppContext();
  const env = useGetEnv();

  const goToClaim = () => {
    const url = `https://${
      env !== ENVType.prod ? `${env}-` : ""
    }app.orderly.network/tradingRewards`;
    window.open(url, "_blank");
  };

  const navigateToPortfolioHistory =
    typeof onRouteChange === "function"
      ? () => {
          onRouteChange({
            href: "/portfolio/history",
            name: t("trading.history"),
          });
        }
      : undefined;

  // console.log('rewards data', rewardsData, layoutContext, props);

  return (
    <>
      <div className="oui-my-1 oui-px-3">
        <AccountStatusMobile />
      </div>
      <Flex
        direction={"column"}
        width={"100%"}
        height={"100%"}
        className="oui-gap-5 oui-px-3"
      >
        <Flex direction="column" width="100%" gapY={2}>
          <PortfolioValueMobile
            toggleVisible={toggleVisible}
            portfolioValue={portfolioValue}
            unrealPnL={unrealPnL}
            unrealROI={unrealROI}
            visible={visible}
            canTrade={canTrade}
            namespace={namespace}
            routerAdapter={layoutContext?.routerAdapter}
          />
          <DepositStatusWidget onClick={navigateToPortfolioHistory} />
          <PortfolioChartsMobileWidget />
        </Flex>
        <PortfolioHandleMobile
          disabled={!canTrade}
          onWithdraw={onWithdraw}
          onDeposit={onDeposit}
          onTransfer={onTransfer}
          isMainAccount={isMainAccount}
          routerAdapter={layoutContext?.routerAdapter}
          hasSubAccount={hasSubAccount}
        />
        <Flex
          direction={"row"}
          width={"100%"}
          height={"100%"}
          className="oui-gap-3"
        >
          {/* Disable trading rewards card for now. Set to row */}
          <Flex direction="row" className="oui-flex-1 oui-gap-3">
            <AffiliateCardMobile
              referralInfo={rewardsData.referralInfo}
              routerAdapter={layoutContext?.routerAdapter}
            />
            <TraderCardMobile
              referralInfo={rewardsData.referralInfo}
              routerAdapter={layoutContext?.routerAdapter}
            />
          </Flex>
          {/* <Flex direction="column" className="oui-flex-1">
            <TradingRewardsCardMobile {...rewardsData} goToClaim={goToClaim} />
          </Flex> */}
        </Flex>
        <SettingRouterMobile routerAdapter={layoutContext?.routerAdapter} />
      </Flex>
    </>
  );
};

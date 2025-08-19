import { FC } from "react";
import { ENVType, useGetEnv } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { Flex } from "@orderly.network/ui";
import { DepositStatusWidget } from "@orderly.network/ui-transfer";
import { useLayoutContext } from "../../../layout/context";
import { useAssetScript } from "../assets";
import { AccountStatusMobile } from "./accountStatus.ui.mobile";
import { AffiliateCardMobile } from "./affiliateCard.ui.mobile";
import { PortfolioHandleMobile } from "./portfolioHandle.ui.mobile";
import { PortfolioValueMobile } from "./portfolioVaule.ui.mobile";
import { SettingRouterMobile } from "./settingRouter.ui.mobile";
import { TraderCardMobile } from "./traderCard.ui.mobile";
import { TradingRewardsCardMobile } from "./tradingRewardsCard.ui.mobile";
import { useRewardsDataScript } from "./useRewardsData.script";

export const MobileOverview: FC = (props) => {
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
          <DepositStatusWidget
            className="oui-mb-2"
            onClick={navigateToPortfolioHistory}
          />
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
          <Flex direction="column" className="oui-flex-1 oui-gap-3">
            <AffiliateCardMobile
              referralInfo={rewardsData.referralInfo}
              routerAdapter={layoutContext?.routerAdapter}
            />
            <TraderCardMobile
              referralInfo={rewardsData.referralInfo}
              routerAdapter={layoutContext?.routerAdapter}
            />
          </Flex>
          <Flex direction="column" className="oui-flex-1">
            <TradingRewardsCardMobile {...rewardsData} goToClaim={goToClaim} />
          </Flex>
        </Flex>
        <SettingRouterMobile routerAdapter={layoutContext?.routerAdapter} />
      </Flex>
    </>
  );
};

import { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { PortfolioHandleMobile } from "./portfolioHandle.ui.mobile";
import { PortfolioValueMobile } from "./portfolioVaule.ui.mobile";
import { AffiliateCardMobile } from "./affiliateCard.ui.mobile";
import { TraderCardMobile } from "./traderCard.ui.mobile";
import { TradingRewardsCardMobile } from "./tradingRewardsCard.ui.mobile";
import { SettingRouterMobile } from "./settingRouter.ui.mobile";
import { useAssetScript } from "../assets";
import { AccountStatusMobile } from "./accountStatus.ui.mobile";
export const MobileOverview: FC = () => {
  const { canTrade, onWithdraw, onDeposit, portfolioValue, unrealPnL, unrealROI, visible, namespace } = useAssetScript();

  console.log('namespace', namespace);

  return <>
    <div className="oui-my-1 oui-px-3">
      <AccountStatusMobile />
    </div>
    <Flex direction={"column"} width={"100%"} height={"100%"} className="oui-px-3 oui-gap-5">
      <PortfolioValueMobile portfolioValue={portfolioValue} unrealPnL={unrealPnL} unrealROI={unrealROI} visible={visible} namespace={namespace} />
      <PortfolioHandleMobile disabled={!canTrade} onWithdraw={onWithdraw} onDeposit={onDeposit} />
      <Flex direction={"row"} width={"100%"} height={"100%"} className="oui-gap-3">
        <Flex direction="column" className="oui-flex-1 oui-gap-3">
          <AffiliateCardMobile />
          <TraderCardMobile />
        </Flex>
        <Flex direction="column" className="oui-flex-1">
          <TradingRewardsCardMobile />
        </Flex>
      </Flex>
      <SettingRouterMobile />
    </Flex>
  </>
};


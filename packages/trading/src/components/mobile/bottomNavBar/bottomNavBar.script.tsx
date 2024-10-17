import { modal } from "@orderly.network/ui";
import { AccountSheetWidget } from "../accountSheet";
import { useTradingPageContext } from "../../../provider/context";
import { PortfolioSheetWidget } from "../portfolioSheet";

export const useBottomNavBarScript = () => {
  const { referral, tradingRewards, bottomSheetLeading } = useTradingPageContext();

  console.log("referral, tradingRewards", referral, tradingRewards,bottomSheetLeading );

  const onShowAccountSheet = () => {
    modal.sheet({
      title: "Account",
      leading: bottomSheetLeading,
      content: <AccountSheetWidget {...referral} {...tradingRewards} />,
    });
  };
  const onShowPortfolioSheet = () => {
    modal.sheet({
      title: "Asset & Margin",
      leading: bottomSheetLeading,
      content: (<PortfolioSheetWidget />)
    });
  };
  return {
    onShowAccountSheet,
    onShowPortfolioSheet,
  };
};

export type BottomNavBarState = ReturnType<typeof useBottomNavBarScript>;

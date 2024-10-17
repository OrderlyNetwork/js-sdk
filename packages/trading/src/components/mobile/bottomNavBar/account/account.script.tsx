import { modal } from "@orderly.network/ui";
import { AccountSheetWidget } from "../../accountSheet";
import { useTradingPageContext } from "../../../../provider/context";

export const useAccountScript = () => {
  const { referral, tradingRewards, bottomSheetLeading } =
    useTradingPageContext();

  const onShowAccountSheet = () => {
    modal.sheet({
      title: "Account",
      leading: bottomSheetLeading,
      content: <AccountSheetWidget {...referral} {...tradingRewards} />,
    });
  };
  return {
    onShowAccountSheet,
  };
};

export type AccountState = ReturnType<typeof useAccountScript>;

import { modal } from "@orderly.network/ui";
import { AccountSheetWidget } from "../../accountSheet";
import { useTradingPageContext } from "../../../../provider/context";
import { useAccount } from "@orderly.network/hooks";

export const useAccountScript = () => {
  const { referral, tradingRewards, bottomSheetLeading } =
    useTradingPageContext();
const { account } = useAccount();

  const onShowAccountSheet = () => {
    modal.sheet({
      title: "Account",
      leading: bottomSheetLeading,
      content: <AccountSheetWidget {...referral} {...tradingRewards} />,
    });
  };
  return {
    onShowAccountSheet,
    address: account.address,
  };
};

export type AccountState = ReturnType<typeof useAccountScript>;

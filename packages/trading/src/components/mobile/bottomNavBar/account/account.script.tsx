import { AccountState as AccountStateType } from "@orderly.network/core";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { modal } from "@orderly.network/ui";
import { useTradingPageContext } from "../../../../provider/tradingPageContext";
import { AccountSheetWidget } from "../../accountSheet";

export const useAccountScript = () => {
  const { t } = useTranslation();
  const { referral, tradingRewards, bottomSheetLeading } =
    useTradingPageContext();
  const { account, state } = useAccount();

  const onShowAccountSheet = () => {
    modal.sheet({
      title: t("common.account"),
      leading: bottomSheetLeading,
      content: <AccountSheetWidget {...referral} {...tradingRewards} />,
    });
  };

  return {
    onShowAccountSheet,
    address: account.address,
    state: state as AccountStateType,
  };
};

export type AccountState = ReturnType<typeof useAccountScript>;

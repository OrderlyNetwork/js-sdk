import { useCallback } from "react";
import { useQuery } from "@orderly.network/hooks";
import { useScreen, modal } from "@orderly.network/ui";
import { DepositAndWithdrawWithSheetId } from "@orderly.network/ui-transfer";
import { AssetHistory } from "./dataTable.ui";
import { AssetHistoryMobile } from "./dataTable.ui.mobile";
import { useAssetHistoryHook } from "./useDataSource.script";

export const AssetHistoryWidget = () => {
  const state = useAssetHistoryHook();
  const { data: chains } = useQuery("/v1/public/chain_info");

  const onDeposit = useCallback(() => {
    modal.show(DepositAndWithdrawWithSheetId, { activeTab: "deposit" });
  }, []);

  const { isMobile } = useScreen();
  if (isMobile) {
    return (
      <AssetHistoryMobile
        {...state}
        onDeposit={onDeposit}
        chains={chains as any}
      />
    );
  }
  return <AssetHistory {...state} />;
};

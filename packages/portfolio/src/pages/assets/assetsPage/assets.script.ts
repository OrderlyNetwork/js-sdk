import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useCollateral,
  useLocalStorage,
  useIndexPricesStream,
  useAppStore,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { EMPTY_LIST } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  TransferDialogId,
} from "@orderly.network/ui-transfer";
import { Decimal, zero } from "@orderly.network/utils";
import { useAccountsData, useAssetsMultiFilter } from "../../../hooks";
import { useAssetTotalValue } from "../../../hooks/useAssetTotalValue";
import { ORDERLY_ASSETS_VISIBLE_KEY } from "../type";
import { useAssetsColumns } from "./assets.column";

export const useAssetsScript = () => {
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );

  const { state, subAccount, isMainAccount } = useAccount();
  const { holding = [] } = useCollateral();
  const { getIndexPrice } = useIndexPricesStream();

  const tokensInfo = useAppStore((state) => state.tokensInfo);

  const subAccounts = state.subAccounts ?? [];

  useEffect(() => {
    if (holding.length > 0) {
      subAccount.refresh();
    }
  }, [holding]);

  // Use the extracted total value hook
  const totalValue = useAssetTotalValue();

  const toggleVisible = () => {
    // @ts-ignore
    setVisible((visible: boolean) => !visible);
  };

  const assetsOptions = useMemo(() => {
    return tokensInfo?.map((item) => ({
      label: item.token,
      value: item.token,
    }));
  }, [tokensInfo]);

  // Use the extracted accounts data hook
  const allAccounts = useAccountsData();

  // Use the extracted account and asset filter hook
  const {
    selectedAccount,
    selectedAsset,
    filteredData: filtered,
    onFilter,
  } = useAssetsMultiFilter(allAccounts);

  // Enhanced filtered data with additional calculations for children
  const enhancedFiltered = useMemo(() => {
    return filtered.map((accountData) => {
      // Enhance each child (holding) with calculated fields
      const enhancedChildren =
        accountData.children?.map((holding) => {
          const tokenInfo = tokensInfo?.find(
            (item) => item.token === holding.token,
          );

          // Use extracted function for index price calculation
          const indexPrice = getIndexPrice(holding.token);

          // Use extracted function for asset value calculation
          const assetValue = new Decimal(holding.holding)
            .mul(indexPrice)
            .toNumber();

          // Calculate collateral ratio for this token
          const collateralRatio = tokenInfo
            ? account.collateralRatio({
                baseWeight: tokenInfo.base_weight ?? 0,
                discountFactor: tokenInfo.discount_factor ?? 0,
                collateralQty: holding.holding,
                collateralCap: tokenInfo?.user_max_qty ?? holding.holding,
                indexPrice: indexPrice,
              })
            : zero;

          // Calculate collateral contribution for this token
          const collateralContribution = account.collateralContribution({
            collateralQty: holding.holding,
            collateralCap: tokenInfo?.user_max_qty ?? holding.holding,
            collateralRatio: collateralRatio.toNumber(),
            indexPrice: indexPrice,
          });

          return {
            ...holding,
            indexPrice,
            assetValue,
            collateralRatio,
            collateralContribution,
          };
        }) || [];

      return {
        ...accountData,
        children: enhancedChildren,
      };
    });
  }, [filtered, getIndexPrice, tokensInfo]);

  const handleTransfer = useCallback((accountId: string, token: string) => {
    if (!accountId) {
      return;
    }
    modal.show(TransferDialogId, {
      toAccountId: accountId,
      token,
    });
  }, []);

  const handleConvert = (accountId: string, token: string) => {
    modal.show("ConvertDialogId", {
      accountId,
      token,
    });
  };

  const showTransfer = isMainAccount ? subAccounts.length > 0 : true;

  const assetsColumns = useAssetsColumns({
    onTransfer: showTransfer ? handleTransfer : undefined,
    onConvert: handleConvert,
  });

  const openDepositAndWithdraw = useCallback(
    (viewName: "deposit" | "withdraw") => {
      modal.show(DepositAndWithdrawWithDialogId, {
        activeTab: viewName,
      });
    },
    [],
  );

  const onDeposit = useCallback(() => {
    openDepositAndWithdraw("deposit");
  }, []);

  const onWithdraw = useCallback(() => {
    openDepositAndWithdraw("withdraw");
  }, []);

  return {
    columns: assetsColumns,
    dataSource: enhancedFiltered, // Use enhanced filtered data with calculated children
    visible: visible as boolean,
    onToggleVisibility: toggleVisible,
    selectedAccount,
    selectedAsset,
    onFilter,
    totalValue,
    hasSubAccount: subAccounts.length > 0,
    onDeposit,
    onWithdraw,
    holding,
    assetsOptions: assetsOptions ?? EMPTY_LIST,
  };
};

export type useAssetsScriptReturn = ReturnType<typeof useAssetsScript> &
  ReturnType<typeof useAccount>;

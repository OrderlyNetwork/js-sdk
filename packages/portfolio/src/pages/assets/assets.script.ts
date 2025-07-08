import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useCollateral,
  useLocalStorage,
  useIndexPricesStream,
  useTokensInfo,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { modal } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  TransferDialogId,
} from "@orderly.network/ui-transfer";
import { useAccountsData } from "../../hooks/useAccountsData";
import {
  calculateAssetValue,
  getIndexPrice,
  useAssetTotalValue,
} from "../../hooks/useAssetTotalValue";
import { useAssetsMultiFilter } from "../../hooks/useAssetsAccountFilter";
import { useAssetsColumns } from "./column";

const ORDERLY_ASSETS_VISIBLE_KEY = "orderly_assets_visible";

export const useAssetsScript = () => {
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );

  const { state, subAccount } = useAccount();
  const { holding = [] } = useCollateral();
  const { data: indexPrices } = useIndexPricesStream();

  const tokensInfo = useTokensInfo();

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
    return (
      tokensInfo?.map((item) => ({
        label: item.token,
        value: item.token,
      })) || []
    );
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
    return filtered.map((accountData: any) => {
      // Enhance each child (holding) with calculated fields
      const enhancedChildren =
        accountData.children?.map((holding: any) => {
          const tokenInfo = tokensInfo?.find(
            (item) => item.token === holding.token,
          );

          // Use extracted function for index price calculation
          const indexPrice = getIndexPrice(holding.token, indexPrices);

          // Use extracted function for asset value calculation
          const assetValue = calculateAssetValue(
            holding.holding,
            holding.token,
            indexPrices,
          ).toNumber();

          // Calculate collateral ratio for this token
          const collateralRatio = tokenInfo
            ? account.collateralRatio({
                baseWeight: tokenInfo.base_weight ?? 0,
                discountFactor: tokenInfo.discount_factor ?? 0,
                collateralQty: holding.holding,
                indexPrice: indexPrice,
              })
            : 0;

          // Calculate collateral contribution for this token
          const collateralContribution = account.collateralContribution({
            collateralQty: holding.holding,
            collateralCap: tokenInfo?.user_max_qty ?? holding.holding,
            collateralRatio: collateralRatio,
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
  }, [filtered, indexPrices, tokensInfo]);

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

  const assetsColumns = useAssetsColumns({
    onTransfer: handleTransfer,
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
    assetsOptions,
  };
};

export type useAssetsScriptReturn = ReturnType<typeof useAssetsScript> &
  ReturnType<typeof useAccount>;

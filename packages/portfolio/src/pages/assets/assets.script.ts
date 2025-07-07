import { useCallback, useMemo } from "react";
import {
  SubAccount,
  useAccount,
  useCollateral,
  useLocalStorage,
  useIndexPricesStream,
  useChains,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  TransferDialogId,
} from "@orderly.network/ui-transfer";
import { Decimal } from "@orderly.network/utils";
import { useAccountsData } from "../../hooks/useAccountsData";
import { useAssetsMultiFilter } from "../../hooks/useAssetsAccountFilter";
import { useAssetsColumns } from "./column";

const isNumber = (val: unknown): val is number => {
  return typeof val === "number" && !Number.isNaN(val);
};

// Extract index price calculation logic
const getIndexPrice = (token: string, indexPrices?: Record<string, number>) => {
  return token === "USDC" ? 1 : (indexPrices?.[`PERP_${token}_USDC`] ?? 0);
};

// Extract asset value calculation logic
const calculateAssetValue = (
  holding: number,
  token: string,
  indexPrices?: Record<string, number>,
) => {
  const indexPrice = getIndexPrice(token, indexPrices);
  return new Decimal(holding).mul(indexPrice);
};

const calculateTotalHolding = (
  data: SubAccount[] | SubAccount["holding"],
  indexPrices?: Record<string, number>,
) => {
  let total = new Decimal(0);
  for (const item of data) {
    if (Array.isArray(item.holding)) {
      for (const hol of item.holding) {
        if (isNumber(hol.holding)) {
          // Use extracted function for asset value calculation
          const assetValue = calculateAssetValue(
            hol.holding,
            hol.token,
            indexPrices,
          );
          total = total.plus(assetValue);
        }
      }
    } else if (isNumber(item.holding) && "token" in item) {
      // Use extracted function for asset value calculation
      const assetValue = calculateAssetValue(
        item.holding,
        (item as any).token,
        indexPrices,
      );
      total = total.plus(assetValue);
    }
  }
  return total;
};

const ORDERLY_ASSETS_VISIBLE_KEY = "orderly_assets_visible";

export const useAssetsScript = () => {
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );

  const { state, isMainAccount } = useAccount();
  const { holding = [] } = useCollateral();
  const { data: indexPrices } = useIndexPricesStream();

  // Get token information including base_weight and discount_factor
  const [chains] = useChains();

  const subAccounts = state.subAccounts ?? [];

  const toggleVisible = () => {
    // @ts-ignore
    setVisible((visible: boolean) => !visible);
  };

  // Create token info map for easy lookup
  const tokenInfoMap = useMemo(() => {
    const map = new Map<string, API.TokenInfo>();
    if (chains) {
      const allChains = Array.isArray(chains)
        ? chains
        : [...(chains.testnet || []), ...(chains.mainnet || [])];
      allChains.forEach((chain: API.Chain) => {
        if (chain.token_infos) {
          chain.token_infos.forEach((tokenInfo: API.TokenInfo) => {
            map.set(tokenInfo.symbol, tokenInfo);
          });
        }
      });
    }
    return map;
  }, [chains]);

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
          const tokenInfo = tokenInfoMap.get(holding.token);

          // Use extracted function for index price calculation
          const indexPrice = getIndexPrice(holding.token, indexPrices);

          // console.log(holding, indexPrice, tokenInfo, tokenInfoMap);

          // Use extracted function for asset value calculation
          const assetValue = calculateAssetValue(
            holding.holding,
            holding.token,
            indexPrices,
          ).toNumber();

          // console.log(tokenInfo, holding, indexPrice, tokenInfoMap);

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
  }, [filtered, indexPrices, tokenInfoMap]);

  const mainTotalValue = useMemo<Decimal>(
    () => calculateTotalHolding(holding, indexPrices),
    [holding, indexPrices],
  );

  const subTotalValue = useMemo<Decimal>(
    () => calculateTotalHolding(subAccounts, indexPrices),
    [subAccounts, indexPrices],
  );

  // console.log(holding, subAccounts, indexPrices);

  const memoizedTotalValue = useMemo<number>(() => {
    if (isMainAccount) {
      return mainTotalValue.plus(subTotalValue).toNumber();
    } else {
      const find = allAccounts.find((item) => item.id === state.accountId);
      if (Array.isArray(find?.children)) {
        return calculateTotalHolding(find.children, indexPrices).toNumber();
      }
      return 0;
    }
  }, [
    isMainAccount,
    mainTotalValue,
    subTotalValue,
    allAccounts,
    state.accountId,
    indexPrices,
  ]);

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
    totalValue: memoizedTotalValue,
    hasSubAccount: subAccounts.length > 0,
    onDeposit,
    onWithdraw,
    holding,
  };
};

export type useAssetsScriptReturn = ReturnType<typeof useAssetsScript> &
  ReturnType<typeof useAccount>;

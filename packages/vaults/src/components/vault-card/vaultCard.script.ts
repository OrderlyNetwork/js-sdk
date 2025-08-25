import { useEffect, useMemo } from "react";
import { useAccount, useCollateral, useGetEnv } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { modal, useScreen } from "@orderly.network/ui";
import { VAULTS_WEBSITE_URLS } from "../../api/env";
import { useSVApiUrl } from "../../hooks/useSVAPIUrl";
import { useVaultLpInfoById, useVaultsStore } from "../../store/vaultsStore";
import { VaultInfo } from "../../types/vault";
import {
  VaultDepositAndWithdrawWithDialogId,
  VaultDepositAndWithdrawWithSheetId,
} from "../vault-operation/depositAndWithdraw";
import { ORDERLY_ICON } from "./constants";

export const useVaultCardScript = (vault: VaultInfo) => {
  const { t } = useTranslation();
  const vaultLpInfo = useVaultLpInfoById(vault.vault_id);
  const { fetchVaultLpInfo } = useVaultsStore();
  const env = useGetEnv();
  const { isMobile } = useScreen();

  const { state } = useAccount();
  const svApiUrl = useSVApiUrl();

  const { holding } = useCollateral();

  const availableBalance = useMemo(() => {
    return holding?.find((h) => h.token === "USDC")?.holding || 0;
  }, [holding]);

  useEffect(() => {
    if (!state.address || !svApiUrl || !vault.vault_id) {
      return;
    }

    // fetchVaultLpPerformance({ vault_id: vault.vault_id }, svApiUrl);
    fetchVaultLpInfo(
      { vault_id: vault.vault_id, wallet_address: state.address },
      svApiUrl,
    );
  }, [vault.vault_id, state.address, svApiUrl]);

  const memoizedAvailableBalance = useMemo(() => {
    return availableBalance;
  }, [availableBalance]);

  const lpInfo = useMemo(() => {
    const info = vaultLpInfo?.[0];
    if (!info) {
      return {
        deposits: "--",
        earnings: "--",
      };
    }
    return {
      deposits: info.lp_tvl - info.potential_pnl,
      earnings: info.potential_pnl,
    };
  }, [vaultLpInfo]);

  const isEVMConnected = useMemo(() => {
    return state.chainNamespace === "EVM";
  }, [state.chainNamespace]);

  const isWrongNetwork = useMemo(() => {
    return (
      state.chainNamespace !== "EVM" && state.accountId !== state.mainAccountId
    );
  }, [state.chainNamespace, state.accountId, state.mainAccountId]);

  const openDepositAndWithdraw = (activeTab: "deposit" | "withdraw") => {
    modal.show(
      isMobile
        ? VaultDepositAndWithdrawWithSheetId
        : VaultDepositAndWithdrawWithDialogId,
      {
        activeTab,
        vaultId: vault.vault_id,
      },
    );
  };

  const openVaultWebsite = () => {
    const url = VAULTS_WEBSITE_URLS[env as keyof typeof VAULTS_WEBSITE_URLS];
    window.open(`${url}/vaults`, "_blank");
  };

  return {
    title: t("vaults.card.orderly.title"),
    description: t("vaults.card.orderly.description"),
    icon: ORDERLY_ICON,
    vaultInfo: vault,
    lpInfo,
    isEVMConnected,
    openDepositAndWithdraw,
    availableBalance: memoizedAvailableBalance,
    openVaultWebsite,
    isWrongNetwork,
  };
};

export type VaultCardScript = ReturnType<typeof useVaultCardScript>;

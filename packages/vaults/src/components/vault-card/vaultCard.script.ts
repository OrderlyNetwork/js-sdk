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
import { getBrokerIconUrl } from "./constants";

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

  const isSOLConnected = useMemo(() => {
    return state.chainNamespace === "SOL";
  }, [state.chainNamespace]);

  const isWrongNetwork = useMemo(() => {
    return (
      state.chainNamespace !== "EVM" &&
      state.chainNamespace !== "SOL" &&
      state.accountId !== state.mainAccountId
    );
  }, [state.chainNamespace, state.accountId, state.mainAccountId]);

  const isButtonsDisabled = useMemo(() => {
    return vault.status !== "live";
  }, [vault.status]);

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
    window.open(
      `https://app.orderly.network/vaults/${vault.vault_address}`,
      "_blank",
    );
  };

  return {
    title: vault.vault_name,
    description: vault.description,
    icon: getBrokerIconUrl(vault.broker_id),
    vaultInfo: vault,
    lpInfo,
    isEVMConnected,
    isSOLConnected,
    openDepositAndWithdraw,
    availableBalance: memoizedAvailableBalance,
    openVaultWebsite,
    isWrongNetwork,
    isButtonsDisabled,
  };
};

export type VaultCardScript = ReturnType<typeof useVaultCardScript>;

import { useEffect, useMemo } from "react";
import { useAccount, useCollateral } from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
import { useSVApiUrl } from "../../hooks/useSVAPIUrl";
import { useVaultLpInfoById, useVaultsStore } from "../../store/vaultsStore";
import { VaultInfo } from "../../types/vault";
import { VaultDepositAndWithdrawWithDialogId } from "../vault-operation/depositAndWithdraw";
import {
  ORDERLY_ICON,
  ORDERLY_VAULT_TITLE,
  ORDERLY_VAULT_DESCRIPTION,
} from "./constants";

export const useVaultCardScript = (vault: VaultInfo) => {
  const vaultLpInfo = useVaultLpInfoById(vault.vault_id);
  const { fetchVaultLpInfo } = useVaultsStore();
  const { availableBalance } = useCollateral();

  const { state } = useAccount();
  const svApiUrl = useSVApiUrl();

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

  const openDepositAndWithdraw = (activeTab: "deposit" | "withdraw") => {
    modal.show(VaultDepositAndWithdrawWithDialogId, {
      activeTab,
      vaultId: vault.vault_id,
    });
  };

  return {
    title: ORDERLY_VAULT_TITLE,
    description: ORDERLY_VAULT_DESCRIPTION,
    icon: ORDERLY_ICON,
    vaultInfo: vault,
    lpInfo,
    isEVMConnected,
    openDepositAndWithdraw,
    availableBalance: memoizedAvailableBalance,
  };
};

export type VaultCardScript = ReturnType<typeof useVaultCardScript>;

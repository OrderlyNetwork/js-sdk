import { useMemo, useState } from "react";
import { useTokenInfo } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useVaultLpInfoById, useVaultsStore } from "../../../store";
import { OperationType } from "../../../types/vault";
import { useOperationScript } from "../depositAndWithdraw/operation.script";

export type VaultWithdrawFormScriptProps = {
  vaultId: string;
};

export const useVaultWithdrawFormScript = (
  props: VaultWithdrawFormScriptProps,
) => {
  const { vaultId } = props;
  const [quantity, setQuantity] = useState<string>("");
  const { handleOperation } = useOperationScript({
    type: OperationType.WITHDRAWAL,
    vaultId,
  });
  const vaultLpInfo = useVaultLpInfoById(vaultId);
  const { vaultInfo } = useVaultsStore();

  const sharePrice = useMemo(() => {
    const vault = vaultInfo.data.find((v) => v.vault_id === vaultId);
    return vault?.est_main_share_price || 0;
  }, [vaultInfo.data, vaultId]);

  const maxQuantity = vaultLpInfo?.[0]?.total_main_shares || 0;

  const receivingAmount = useMemo(() => {
    if (!quantity || !sharePrice) {
      return "-";
    }
    return new Decimal(quantity).mul(sharePrice).toString();
  }, [quantity, sharePrice]);

  const handleWithdraw = async () => {
    await handleOperation({
      amount: quantity,
      vaultId,
    });
  };

  return {
    quantity,
    onQuantityChange: setQuantity,
    maxQuantity,
    handleWithdraw,
    vaultId,
    sharePrice,
    receivingAmount,
  };
};

export type VaultWithdrawFormScript = ReturnType<
  typeof useVaultWithdrawFormScript
>;

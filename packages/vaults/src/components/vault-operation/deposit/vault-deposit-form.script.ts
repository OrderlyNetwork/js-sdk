import { useMemo, useState } from "react";
import { useTokenInfo, useCollateral } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useVaultsStore } from "../../../store/vaultsStore";
import { OperationType } from "../../../types/vault";
import { useOperationScript } from "../depositAndWithdraw/operation.script";

export type VaultDepositWidgetProps = {
  vaultId: string;
};

export const useVaultDepositFormScript = (props: VaultDepositWidgetProps) => {
  const { vaultId } = props;
  const [quantity, setQuantity] = useState<string>("");
  const { vaultInfo } = useVaultsStore();
  const { handleOperation } = useOperationScript({
    type: OperationType.DEPOSIT,
    vaultId,
  });
  const { holding } = useCollateral();

  const availableBalance = useMemo(() => {
    return holding?.find((h) => h.token === "USDC")?.holding || 0;
  }, [holding]);

  const sharePrice = useMemo(() => {
    const vault = vaultInfo.data.find((v) => v.vault_id === vaultId);
    return vault?.est_main_share_price;
  }, [vaultInfo.data, vaultId]);

  const shares = useMemo(() => {
    if (!sharePrice || !quantity) {
      return "-";
    }
    return new Decimal(quantity).div(sharePrice).toString();
  }, [quantity, sharePrice]);

  const handleDeposit = async () => {
    if (!shares || shares === "-") {
      return;
    }
    await handleOperation({
      amount: quantity,
      vaultId,
    });
    setQuantity("");
  };

  const token = useTokenInfo("USDC");

  const sourceToken = useMemo(() => {
    return {
      ...token,
      display_name: token?.token,
      symbol: token?.token,
    };
  }, [token]);

  const onQuantityChange = (value: string) => {
    if (value && new Decimal(value).gt(availableBalance)) {
      setQuantity(availableBalance.toString());
      return;
    }
    setQuantity(value);
  };

  return {
    quantity,
    onQuantityChange,
    sourceToken,
    maxQuantity: availableBalance,
    sharePrice,
    shares,
    handleDeposit,
    vaultId,
  };
};

export type VaultDepositFormScript = ReturnType<
  typeof useVaultDepositFormScript
>;

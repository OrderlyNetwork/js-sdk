import { useMemo, useState } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Decimal } from "@kodiak-finance/orderly-utils";
import {
  useVaultInfoState,
  useVaultLpInfoById,
  useVaultsStore,
} from "../../../store";
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
  const { handleOperation, disabledOperation } = useOperationScript({
    type: OperationType.WITHDRAWAL,
    vaultId,
  });
  const vaultLpInfo = useVaultLpInfoById(vaultId);
  const { vaultInfo } = useVaultsStore();
  const { t } = useTranslation();

  const sharePrice = useMemo(() => {
    const vault = vaultInfo.data.find((v) => v.vault_id === vaultId);
    return vault?.est_main_share_price || 0;
  }, [vaultInfo.data, vaultId]);

  const maxQuantity = vaultLpInfo?.[0]?.available_main_shares || 0;

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

  const onQuantityChange = (value: string) => {
    if (value && new Decimal(value).gt(maxQuantity)) {
      setQuantity(maxQuantity.toString());
    } else {
      setQuantity(value);
    }
  };

  const isMinAmount = useMemo(() => {
    if (
      !quantity ||
      !vaultInfo.data[0]?.est_main_share_price ||
      !vaultInfo.data[0]?.min_withdrawal_amount
    )
      return false;
    const isAll = quantity === maxQuantity.toString();

    if (isAll) {
      return false;
    }

    const receiving = new Decimal(quantity).mul(
      vaultInfo.data[0]?.est_main_share_price,
    );
    return receiving.lt(vaultInfo.data[0]?.min_withdrawal_amount);
  }, [quantity, vaultInfo, maxQuantity]);

  const disabledWithdraw = useMemo(() => {
    return (
      !quantity ||
      quantity === "0" ||
      disabledOperation ||
      (!!quantity && isMinAmount)
    );
  }, [quantity, disabledOperation]);

  const inputHint = useMemo(() => {
    if (quantity && isMinAmount) {
      return {
        hintMessage: t("vaults.operation.error.minWithdrawal", {
          amount: vaultInfo.data[0]?.min_withdrawal_amount,
        }),
        status: "error",
      };
    }
    return {
      hintMessage: "",
      status: "",
    };
  }, [quantity, t]);

  return {
    quantity,
    onQuantityChange,
    maxQuantity,
    handleWithdraw,
    vaultId,
    sharePrice,
    receivingAmount,
    disabledWithdraw,
    disabledOperation,
    inputHint,
  };
};

export type VaultWithdrawFormScript = ReturnType<
  typeof useVaultWithdrawFormScript
>;

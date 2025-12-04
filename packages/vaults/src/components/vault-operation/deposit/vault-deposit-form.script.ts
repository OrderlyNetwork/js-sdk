import { useMemo, useState } from "react";
import {
  useTokenInfo,
  useCollateral,
  useMaxWithdrawal,
} from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { Decimal } from "@veltodefi/utils";
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
  const { handleOperation, disabledOperation } = useOperationScript({
    type: OperationType.DEPOSIT,
    vaultId,
  });
  const { holding } = useCollateral();
  const { t } = useTranslation();

  const minDepositAmount = vaultInfo.data[0]?.min_deposit_amount || 0;

  const maxWithdrawalAmount = useMaxWithdrawal("USDC");
  const availableBalance = useMemo(() => {
    return holding?.find((h) => h.token === "USDC")?.holding || 0;
  }, [holding]);
  const maxQuantity = useMemo(() => {
    return Math.min(maxWithdrawalAmount, availableBalance);
  }, [maxWithdrawalAmount, availableBalance]);

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
    if (value && new Decimal(value).gt(maxQuantity)) {
      setQuantity(maxQuantity.toString());
      return;
    }
    setQuantity(value);
  };

  const disabledDeposit = useMemo(() => {
    return (
      !quantity ||
      quantity === "0" ||
      disabledOperation ||
      (!!quantity && new Decimal(quantity).lt(minDepositAmount))
    );
  }, [quantity, disabledOperation]);

  const inputHint = useMemo(() => {
    if (quantity && new Decimal(quantity).lt(minDepositAmount)) {
      return {
        hintMessage: t("vaults.operation.error.minDeposit", {
          amount: minDepositAmount,
        }),
        status: "error",
      };
    }
    return {
      hintMessage: "",
      status: "",
    };
  }, [quantity, t, maxWithdrawalAmount, availableBalance]);

  return {
    quantity,
    onQuantityChange,
    sourceToken,
    maxQuantity,
    sharePrice,
    shares,
    handleDeposit,
    vaultId,
    disabledDeposit,
    disabledOperation,
    inputHint,
  };
};

export type VaultDepositFormScript = ReturnType<
  typeof useVaultDepositFormScript
>;

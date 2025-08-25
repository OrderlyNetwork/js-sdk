import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Text,
  Button,
  modal,
  SimpleDialog,
  useModal,
  cn,
} from "@orderly.network/ui";
import {
  BrokerWallet,
  QuantityInput,
  AvailableQuantity,
} from "@orderly.network/ui-transfer";
import { LatestWithdrawWidget } from "../latest-withdraw";
import { VaultWithdrawFormScript } from "./vault-withdraw-form.script";
import { WithdrawProcessWidget } from "./withdraw-process.ui";

export const VaultWithdrawForm: FC<VaultWithdrawFormScript> = (props) => {
  const {
    quantity,
    onQuantityChange,
    maxQuantity,
    handleWithdraw,
    vaultId,
    sharePrice,
    receivingAmount,
  } = props;

  const handleInitialWithdraw = () => {
    modal.show(WithdrawInitialDialog, {
      quantity,
      receivingAmount,
      handleWithdraw,
    });
  };

  const { t } = useTranslation();
  return (
    <div>
      <BrokerWallet />
      <Box mt={3} mb={1}>
        <QuantityInput
          value={quantity}
          onValueChange={onQuantityChange}
          token={{ display_name: "Shares", precision: 6 } as any}
          testId="oui-testid-vault-withdraw-dialog-quantity-input"
        />
      </Box>
      <AvailableQuantity
        maxQuantity={maxQuantity}
        onClick={() => {
          onQuantityChange(maxQuantity.toString());
        }}
      />

      <WithdrawKVItem
        label={t("vaults.withdraw.estPricePerShare")}
        currency="$"
        value={sharePrice || "-"}
        className="oui-mb-1 oui-mt-5"
      />
      <WithdrawKVItem
        label={t("vaults.withdraw.estReceivingAmount")}
        value={receivingAmount}
        suffix={
          <span className="oui-ml-1 oui-text-base-contrast-36">USDC</span>
        }
        className="oui-mb-1"
      />

      <Button
        fullWidth
        color="primary"
        disabled={!quantity || quantity === "0"}
        className="oui-mt-8"
        onClick={handleInitialWithdraw}
      >
        {t("common.withdraw")}
      </Button>
      <div className="oui-mt-3">
        <LatestWithdrawWidget vaultId={vaultId} />
      </div>
    </div>
  );
};

type WithdrawKVItemProps = {
  label: string;
  value: string | number;
  suffix?: React.ReactNode;
  currency?: string;
  className?: string;
};
const WithdrawKVItem = ({
  label,
  value,
  suffix,
  currency,
  className,
}: WithdrawKVItemProps) => {
  return (
    <div
      className={cn(
        "oui-flex oui-items-center oui-justify-between oui-text-sm oui-font-semibold oui-text-base-contrast-54",
        className,
      )}
    >
      <div>{label}</div>
      <Text.numeral
        currency={currency}
        className="oui-text-base-contrast"
        suffix={suffix}
      >
        {value}
      </Text.numeral>
    </div>
  );
};

const WithdrawInitialDialog = modal.create(
  ({
    quantity,
    receivingAmount,
    handleWithdraw,
  }: {
    quantity: string;
    receivingAmount: string;
    handleWithdraw: () => void;
  }) => {
    const { visible, hide, onOpenChange } = useModal();
    const { t } = useTranslation();
    return (
      <SimpleDialog
        title={t("vaults.withdraw.dialog.title")}
        open={visible}
        onOpenChange={onOpenChange}
      >
        <div className="oui-flex oui-flex-col">
          <WithdrawKVItem
            label={t("vaults.withdraw.dialog.withdrawalAmount")}
            value={quantity}
            suffix={
              <span className="oui-ml-1 oui-text-base-contrast-36">Shares</span>
            }
          />
          <WithdrawKVItem
            label={t("vaults.withdraw.dialog.estimatedReceiving")}
            value={receivingAmount}
            suffix={
              <span className="oui-ml-1 oui-text-base-contrast-36">USDC</span>
            }
            className="oui-mt-1"
          />
          <Text
            color="warning"
            className="oui-my-5 oui-text-sm oui-font-semibold"
          >
            {t("vaults.withdraw.dialog.note")}
          </Text>
          <WithdrawProcessWidget />
          <Button
            fullWidth
            color="primary"
            className="oui-mt-5"
            onClick={async () => {
              await handleWithdraw();
              hide();
            }}
          >
            {t("vaults.withdraw.dialog.initiateWithdrawal")}
          </Button>
        </div>
      </SimpleDialog>
    );
  },
);

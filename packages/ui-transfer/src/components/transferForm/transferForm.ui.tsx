import { FC } from "react";
import { Trans, useTranslation } from "@orderly.network/i18n";
import { Box, Button, Flex, textVariants, Text, cn } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { TransferVerticalIcon } from "../../icons";
import { AccountSelect } from "../accountSelect";
import { AvailableQuantity } from "../availableQuantity";
import { ExchangeDivider } from "../exchangeDivider";
import { QuantityInput } from "../quantityInput";
import { UnsettlePnlInfo } from "../unsettlePnlInfo";
import { TransferFormScriptReturn } from "./transferForm.script";

export type TransferFormProps = {
  close?: () => void;
} & TransferFormScriptReturn;

export const TransferForm: FC<TransferFormProps> = (props) => {
  const {
    networkId,
    disabled,
    onTransfer,
    quantity,
    onQuantityChange,
    amount,
    dst,
    maxQuantity,
    submitting,
    isMainAccount,
    mainAccountId,
    accountId,
    subAccounts,
    hintMessage,
    inputStatus,
    hasPositions,
    onSettlePnl,
    unsettledPnL,
    currentAssetValue,
    toAccountId,
    setToAccountId,
  } = props;
  const { t } = useTranslation();

  const buttonSize = { initial: "md", lg: "lg" } as const;

  return (
    <Box id="oui-deposit-form" className={textVariants({ weight: "semibold" })}>
      <Box className="oui-mb-6 lg:oui-mb-8">
        <Text size="sm" intensity={98}>
          {t("transfer.internalTransfer.from")}
        </Text>
        <Box mt={1} mb={1}>
          <AccountSelect
            isMainAccount={isMainAccount}
            subAccounts={isMainAccount ? [] : subAccounts}
            value={isMainAccount ? accountId : toAccountId}
            onValueChange={setToAccountId}
          />
          <QuantityInput
            classNames={{
              root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
            }}
            value={quantity}
            onValueChange={onQuantityChange}
            token={dst}
            hintMessage={hintMessage}
            status={inputStatus}
          />
        </Box>
        <AvailableQuantity
          token={dst}
          amount={amount}
          maxQuantity={maxQuantity}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
        />
        <Box mx={2} mt={1}>
          <UnsettlePnlInfo
            unsettledPnl={unsettledPnL}
            hasPositions={hasPositions}
            onSettlePnl={onSettlePnl}
            tooltipContent={t("transfer.internalTransfer.unsettled.tooltip")}
            dialogContent={
              // @ts-ignore
              <Trans i18nKey="transfer.internalTransfer.settlePnl.description" />
            }
          />
        </Box>

        <ExchangeDivider
          icon={<TransferVerticalIcon className="oui-text-primary" />}
        />
        <Text size="sm" intensity={98}>
          {t("transfer.internalTransfer.to")}
        </Text>
        <Box mt={1}>
          <AccountSelect
            subAccounts={isMainAccount ? subAccounts : []}
            value={isMainAccount ? toAccountId : mainAccountId}
            onValueChange={setToAccountId}
          />
          <Flex
            className={cn(
              "oui-mt-[2px] oui-h-[31px] oui-text-base-contrast-54",
              "oui-rounded-b-xl oui-rounded-t-sm",
            )}
            justify="between"
            itemAlign="center"
            px={3}
            intensity={600}
          >
            <Text size="2xs">
              {t("transfer.internalTransfer.currentAssetValue")}
            </Text>
            <Text.numeral size="2xs" intensity={54} unit=" USDC">
              {currentAssetValue}
            </Text.numeral>
          </Flex>
        </Box>
      </Box>
      <Flex justify="center">
        <Box className="oui-min-w-[184px]">
          <AuthGuard
            networkId={networkId}
            buttonProps={{
              fullWidth: true,
              size: buttonSize,
            }}
          >
            <Button
              fullWidth
              disabled={disabled}
              loading={submitting}
              size={buttonSize}
              onClick={onTransfer}
            >
              {t("common.transfer")}
            </Button>
          </AuthGuard>
        </Box>
      </Flex>
    </Box>
  );
};

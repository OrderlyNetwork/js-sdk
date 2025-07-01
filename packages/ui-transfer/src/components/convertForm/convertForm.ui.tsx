import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, textVariants } from "@orderly.network/ui";
import { WithdrawTo } from "../../types";
import { AvailableQuantity } from "../availableQuantity";
import { ExchangeDivider } from "../exchangeDivider";
import { QuantityInput } from "../quantityInput";
import { WithdrawAction } from "../withdrawAction";
import { WithdrawWarningMessage } from "../withdrawWarningMessage";
import type { ConvertFormScriptReturn } from "./convertForm.script";

export type ConvertFormProps = ConvertFormScriptReturn;

export const ConvertFormUI: React.FC<ConvertFormProps> = (props) => {
  const {
    address,
    loading,
    disabled,
    quantity,
    onQuantityChange,
    token,
    amount,
    maxQuantity,
    currentChain,
    fee,
    chainVaultBalance,
    crossChainTrans,
    checkIsBridgeless,
    withdrawTo,
    sourceTokens,
    onSourceTokenChange,
    vaultBalanceList,
  } = props;

  const { t } = useTranslation();

  return (
    <Box className={textVariants({ weight: "semibold" })}>
      <Box className="oui-mb-6 lg:oui-mb-8">
        <Box mt={3} mb={1}>
          <QuantityInput
            value={quantity}
            onValueChange={onQuantityChange}
            token={token}
            tokens={sourceTokens}
            onTokenChange={onSourceTokenChange}
            status={props.inputStatus}
            hintMessage={props.hintMessage}
            vaultBalanceList={vaultBalanceList}
          />
        </Box>
        <AvailableQuantity
          token={token}
          amount={amount}
          maxQuantity={maxQuantity.toString()}
          loading={props.balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
        />
        <ExchangeDivider />
        <QuantityInput token={token} value={props.showQty} readOnly />
        <Flex direction="column" mt={1} gapY={1} itemAlign="start">
          <Text size="xs" intensity={36}>
            {t("common.fee")}
            {withdrawTo === WithdrawTo.Wallet ? (
              <>
                {" ≈ "}
                <Text size="xs" intensity={80}>
                  {fee}
                </Text>
              </>
            ) : (
              <>
                {" = "}
                <Text size="xs" intensity={80}>
                  0
                </Text>
              </>
            )}

            <Text>{` USDC`}</Text>
          </Text>
        </Flex>
      </Box>

      <WithdrawWarningMessage
        checkIsBridgeless={checkIsBridgeless}
        chainVaultBalance={chainVaultBalance as number}
        currentChain={currentChain}
        quantity={quantity}
        maxAmount={maxQuantity}
        crossChainTrans={crossChainTrans}
      />

      <Flex justify="center">
        <WithdrawAction
          checkIsBridgeless={checkIsBridgeless}
          networkId={props.networkId}
          disabled={disabled}
          loading={loading}
          onWithdraw={props.onWithdraw}
          crossChainWithdraw={props.crossChainWithdraw}
          currentChain={currentChain}
          address={address}
          quantity={quantity}
          fee={fee}
          withdrawTo={withdrawTo}
          onTransfer={props.onTransfer}
        />
      </Flex>
    </Box>
  );
};

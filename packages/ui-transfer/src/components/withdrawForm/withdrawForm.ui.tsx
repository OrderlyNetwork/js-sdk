import { Trans, useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, textVariants } from "@orderly.network/ui";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { ExchangeDivider } from "../exchangeDivider";
import { QuantityInput } from "../quantityInput";
import { UnsettlePnlInfo } from "../unsettlePnlInfo";
import { Web3Wallet } from "../web3Wallet";
import { WithdrawAction } from "../withdrawAction";
import { WithdrawWarningMessage } from "../withdrawWarningMessage";
import { WithdrawFormScriptReturn } from "./withdrawForm.script";

export type WithdrawFormProps = WithdrawFormScriptReturn;

export const WithdrawForm = ({
  address,
  loading,
  disabled,
  quantity,
  onQuantityChange,
  token,
  inputStatus,
  hintMessage,
  amount,
  maxQuantity,
  balanceRevalidating,
  chains,
  currentChain,
  onChainChange,
  fee,
  settingChain,
  wrongNetwork,
  hasPositions,
  unsettledPnL,
  onSettlePnl,
  onWithdraw,
  chainVaultBalance,
  crossChainWithdraw,
  crossChainTrans,
  showQty,
  networkId,
  checkIsBridgeless,
}: WithdrawFormProps) => {
  const { t } = useTranslation();

  return (
    <Box
      id="oui-withdraw-form"
      className={textVariants({ weight: "semibold" })}
    >
      <Box className="oui-mb-6 lg:oui-mb-8">
        <BrokerWallet />
        <Box mt={3} mb={1}>
          <QuantityInput
            value={quantity}
            onValueChange={onQuantityChange}
            token={token}
            onTokenChange={() => {}}
            status={inputStatus}
            hintMessage={hintMessage}
            testId="oui-testid-withdraw-dialog-quantity-input"
          />
        </Box>

        <AvailableQuantity
          token={token}
          amount={amount}
          maxQuantity={maxQuantity.toString()}
          loading={balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
        />
        <Box mx={2} mt={1}>
          <UnsettlePnlInfo
            unsettledPnl={unsettledPnL}
            hasPositions={hasPositions}
            onSettlePnl={onSettlePnl}
            tooltipContent={t("settle.unsettled.tooltip")}
            // @ts-ignore
            dialogContent={<Trans i18nKey="settle.settlePnl.description" />}
          />
        </Box>

        <ExchangeDivider />
        <Web3Wallet />
        <Box mt={3}>
          <ChainSelect
            chains={chains}
            value={currentChain!}
            onValueChange={onChainChange}
            wrongNetwork={wrongNetwork}
            loading={settingChain}
          />
          <QuantityInput
            classNames={{
              root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
            }}
            token={token}
            value={showQty}
            readOnly
          />
        </Box>
        <Flex direction="column" mt={1} gapY={1} itemAlign="start">
          <Text size="xs" intensity={36}>
            {`${t("common.fee")} ≈ `}
            <Text size="xs" intensity={80}>
              {`${fee} `}
            </Text>
            <Text>USDC</Text>
          </Text>
        </Flex>
      </Box>

      <WithdrawWarningMessage
        checkIsBridgeless={checkIsBridgeless}
        chainVaultBalance={chainVaultBalance}
        currentChain={currentChain}
        quantity={quantity}
        maxAmount={maxQuantity}
        crossChainTrans={crossChainTrans}
      />

      <Flex justify="center">
        <WithdrawAction
          checkIsBridgeless={checkIsBridgeless}
          networkId={networkId}
          disabled={disabled}
          loading={loading}
          onWithdraw={onWithdraw}
          crossChainWithdraw={crossChainWithdraw}
          currentChain={currentChain}
          address={address}
          quantity={quantity}
          fee={fee}
        />
      </Flex>
    </Box>
  );
};

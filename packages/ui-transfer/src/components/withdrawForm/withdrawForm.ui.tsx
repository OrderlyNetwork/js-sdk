import React from "react";
import { useQuery } from "@orderly.network/hooks";
import { Trans, useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Flex,
  Text,
  textVariants,
  Tabs,
  TabPanel,
  WalletIcon,
} from "@orderly.network/ui";
import { WithdrawTo } from "../../types";
import { TextAreaInput } from "../accountIdInput";
import { AvailableQuantity } from "../availableQuantity";
import { BrokerWallet } from "../brokerWallet";
import { ChainSelect } from "../chainSelect";
import { ExchangeDivider } from "../exchangeDivider";
import { QuantityInput } from "../quantityInput";
import { UnsettlePnlInfo } from "../unsettlePnlInfo";
import { WithdrawAction } from "../withdrawAction";
import { WithdrawWarningMessage } from "../withdrawWarningMessage";
import { WithdrawFormScriptReturn } from "./withdrawForm.script";

export type WithdrawFormProps = WithdrawFormScriptReturn;

export const WithdrawForm: React.FC<WithdrawFormProps> = (props) => {
  const {
    address,
    loading,
    disabled,
    quantity,
    onQuantityChange,
    token,
    amount,
    maxQuantity,
    chains,
    currentChain,
    fee,
    settingChain,
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
            tokens={sourceTokens}
            onTokenChange={onSourceTokenChange}
            status={props.inputStatus}
            hintMessage={props.hintMessage}
            vaultBalanceList={vaultBalanceList}
            testId="oui-testid-withdraw-dialog-quantity-input"
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
        <Box mx={2} mt={1}>
          <UnsettlePnlInfo
            unsettledPnl={props.unsettledPnL}
            hasPositions={props.hasPositions}
            onSettlePnl={props.onSettlePnl}
            tooltipContent={t("settle.unsettled.tooltip")}
            dialogContent={<Trans i18nKey="settle.settlePnl.description" />}
          />
        </Box>
        <ExchangeDivider />
        <Tabs
          value={withdrawTo}
          onValueChange={props.setWithdrawTo as (tab: string) => void}
          variant="contained"
          size="lg"
          classNames={{
            tabsList: "oui-px-0",
            tabsContent: "oui-pt-3",
          }}
        >
          <TabPanel
            title={t("transfer.web3Wallet.my")}
            icon={<WalletIcon size={"xs"} name={props.walletName ?? ""} />}
            value={WithdrawTo.Wallet}
          >
            <ChainSelect
              chains={chains}
              value={currentChain!}
              onValueChange={props.onChainChange}
              wrongNetwork={props.wrongNetwork}
              loading={settingChain}
            />
            <QuantityInput
              classNames={{
                root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
              }}
              token={token}
              value={props.showQty}
              readOnly
            />
          </TabPanel>
          <TabPanel
            title={t("transfer.withdraw.otherAccount", {
              brokerName: props.brokerName,
            })}
            value={WithdrawTo.Account}
          >
            <TextAreaInput
              label={t("common.accountId")}
              value={props.toAccountId}
              onChange={props.setToAccountId}
              status={props.toAccountIdInputStatus}
              hintMessage={props.toAccountIdHintMessage}
            />
            <Box my={2}>
              <Text size="xs" intensity={54}>
                {t("transfer.withdraw.accountId.tips")}
              </Text>
            </Box>
          </TabPanel>
        </Tabs>

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

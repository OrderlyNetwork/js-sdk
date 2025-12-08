import React from "react";
import { Trans, useTranslation } from "@veltodefi/i18n";
import {
  Box,
  Flex,
  Text,
  textVariants,
  Tabs,
  TabPanel,
  ArrowLeftRightIcon,
  WalletIcon,
} from "@veltodefi/ui";
import { WithdrawTo } from "../../types";
import { LtvWidget } from "../LTV";
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
    sourceToken,
    amount,
    maxQuantity,
    tokenChains,
    currentChain,
    fee,
    settingChain,
    crossChainTrans,
    checkIsBridgeless,
    withdrawTo,
    sourceTokens,
    onSourceTokenChange,
    vaultBalanceList,
    qtyGreaterThanMaxAmount,
    isTokenUnsupported,
    onSwitchToSupportedNetwork,
  } = props;

  const { t } = useTranslation();

  const internalWithdrawPanel = (
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
        disabled={!props.isLoggedIn}
      />
      <Box my={2}>
        <Text size="xs" intensity={54}>
          {t("transfer.withdraw.accountId.tips")}
        </Text>
      </Box>
    </TabPanel>
  );

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
            token={sourceToken}
            tokens={sourceTokens}
            onTokenChange={onSourceTokenChange}
            status={props.inputStatus}
            hintMessage={props.hintMessage}
            hintSuffix={
              isTokenUnsupported ? (
                <button
                  type="button"
                  onClick={onSwitchToSupportedNetwork}
                  className="oui-inline-flex oui-items-center oui-gap-1 oui-text-2xs oui-font-semibold oui-text-primary"
                >
                  {t("common.switch")}
                  <ArrowLeftRightIcon
                    size={16}
                    className="oui-text-primary oui-mt-0.5"
                    opacity={1}
                  />
                </button>
              ) : undefined
            }
            vaultBalanceList={vaultBalanceList}
            testId="oui-testid-withdraw-dialog-quantity-input"
            displayType="vaultBalance"
            disabled={!props.isLoggedIn}
          />
        </Box>
        <AvailableQuantity
          token={sourceToken}
          amount={amount}
          maxQuantity={maxQuantity.toString()}
          loading={props.balanceRevalidating}
          onClick={() => {
            onQuantityChange(maxQuantity.toString());
          }}
          tooltipContent={t("transfer.withdraw.available.tooltip", {
            amount: maxQuantity.toString(),
          })}
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
            icon={
              props.walletName ? (
                <WalletIcon size={"xs"} name={props.walletName ?? ""} />
              ) : undefined
            }
            value={WithdrawTo.Wallet}
          >
            <ChainSelect
              chains={tokenChains}
              value={currentChain!}
              onValueChange={props.onChainChange}
              wrongNetwork={props.wrongNetwork}
              loading={settingChain}
              disabled={!props.isLoggedIn}
            />
            <QuantityInput
              classNames={{
                root: "oui-mt-[2px] oui-rounded-t-sm oui-rounded-b-xl",
              }}
              token={sourceToken}
              value={props.showQty}
              readOnly
            />
          </TabPanel>
          {internalWithdrawPanel}
        </Tabs>
        <Box mt={2}>
          <LtvWidget
            showDiff={typeof quantity !== "undefined" && Number(quantity) > 0}
            currentLtv={props.currentLTV}
            nextLTV={props.nextLTV}
          />
        </Box>
        <Flex direction="column" mt={1} gapY={1} itemAlign="start">
          <Text size="xs" intensity={36}>
            {t("common.fee")}
            {withdrawTo === WithdrawTo.Wallet ? " ≈ " : " = "}
            <Text size="xs" intensity={80}>
              {fee}
            </Text>
          </Text>
        </Flex>
      </Box>
      <WithdrawWarningMessage
        checkIsBridgeless={checkIsBridgeless}
        crossChainTrans={crossChainTrans}
        qtyGreaterThanMaxAmount={qtyGreaterThanMaxAmount}
        message={props.warningMessage}
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

import { FC, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  cn,
  textVariants,
  WalletIcon,
  Spinner,
  DialogPortal,
} from "@orderly.network/ui";
import { formatCompact } from "../../constants";
import { ChainSelect } from "../chainSelect";
import { ExchangeDivider } from "../exchangeDivider";
import { HistoryDropdown } from "../historyDropdown";
import { PartnerSelect } from "../partnerSelect";
import { PaymentMethodSelect } from "../paymentMethodSelect";
import { QuantityInput, CurrencySuffix, TokenSuffix } from "../quantityInput";
import { QuoteCountdown } from "../quoteCountdown";
import { OnrampFormState } from "./onrampForm.script";

export type OnrampFormProps = OnrampFormState & {
  close?: () => void;
};

export const OnrampFormUI: FC<OnrampFormProps> = (props) => {
  const {
    paymentMethods,
    selectedPaymentMethod,
    onPaymentMethodChange,
    fiatCurrencies,
    selectedCurrency,
    onCurrencyChange,
    spendAmount,
    onSpendAmountChange,
    presetAmounts,
    chains,
    selectedChain,
    onChainChange,
    wallet,
    address,
    receiveQuantity,
    receiveQuantityPlaceholder,
    partners,
    selectedPartner,
    onPartnerChange,
    exchangeRateText,
    isQuoteLoading,
    onContinue,
    isContinueDisabled,
    iframeDialogOpen,
    onramperIframeUrl,
    quoteIsValidating,
    spendAmountError,
    transactions,
    pendingTransactions,
  } = props;
  console.log("onramperIframeUrl", onramperIframeUrl);
  const formRef = useRef<HTMLDivElement>(null);

  return (
    <Box id="oui-onramp-form" className={textVariants({ weight: "semibold" })}>
      <Flex
        ref={formRef}
        direction="column"
        className="oui-w-full oui-tracking-[0.03em]"
      >
        {/* ════════════════ YOU SPEND ════════════════ */}
        <Flex
          direction="column"
          itemAlign="start"
          className="oui-w-full"
          gap={3}
        >
          <HistoryDropdown
            transactions={transactions}
            pendingTransactions={pendingTransactions}
            containerRef={formRef}
          />

          <Flex direction="column" className="oui-w-full" gap={2}>
            {/* Stacked: PaymentMethodSelect (top) + QuantityInput (bottom) */}
            <Box className="oui-w-full">
              <PaymentMethodSelect
                methods={selectedPaymentMethod ? paymentMethods : []}
                value={
                  selectedPaymentMethod ?? {
                    id: "_",
                    name: "No available payment method",
                  }
                }
                onValueChange={onPaymentMethodChange}
                disabled={!selectedPaymentMethod}
                loading={isQuoteLoading && !selectedPaymentMethod}
              />
              <QuantityInput
                value={spendAmount}
                onValueChange={onSpendAmountChange}
                placeholder={presetAmounts[0].toString()}
                error={spendAmountError}
                suffix={
                  <CurrencySuffix
                    currencies={fiatCurrencies}
                    selected={selectedCurrency}
                    onSelect={(c) => onCurrencyChange(c as any)}
                  />
                }
                classNames={{
                  root: "oui-mt-1 oui-rounded-t-[4px] oui-rounded-b-xl",
                }}
              />
            </Box>

            {/* Preset amount buttons */}
            <Flex gap={3} className="oui-w-full">
              {presetAmounts.map((amount) => (
                <Flex
                  key={amount}
                  justify="center"
                  itemAlign="center"
                  className={cn(
                    "oui-h-6 oui-flex-1 oui-cursor-pointer oui-rounded",
                    "oui-bg-base-6 oui-transition-colors hover:oui-bg-base-5",
                  )}
                  onClick={() => onSpendAmountChange(amount.toString())}
                >
                  <Text size="2xs" intensity={36} weight="semibold">
                    {formatCompact(amount)}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>

        <ExchangeDivider />

        {/* ════════════════ YOU RECEIVE ════════════════ */}
        <Flex
          direction="column"
          itemAlign="start"
          className="oui-w-full"
          gap={3}
        >
          <Flex justify="between" className="oui-w-full">
            <Text size="sm" intensity={98} weight="semibold">
              You receive
            </Text>

            <Flex gapX={1}>
              <WalletIcon size={"2xs"} name={wallet?.label ?? ""} />
              <Text.formatted size="sm" intensity={54} rule="address">
                {address}
              </Text.formatted>
            </Flex>
          </Flex>

          <Flex direction="column" className="oui-w-full" gap={1}>
            {/* Row 1: ChainSelect (left) + Read-only Quantity (right) */}
            <Flex className="oui-w-full" gap={1}>
              <Box className="oui-min-w-0 oui-flex-1">
                <ChainSelect
                  chains={chains}
                  value={selectedChain!}
                  onValueChange={onChainChange}
                  wrongNetwork={!selectedChain}
                  className="oui-w-full oui-rounded-[4px] oui-rounded-tl-xl"
                />
              </Box>
              <Box className="oui-min-w-0 oui-flex-1">
                <QuantityInput
                  readOnly
                  loading={isQuoteLoading}
                  value={isQuoteLoading ? "" : receiveQuantity}
                  placeholder={isQuoteLoading ? "" : receiveQuantityPlaceholder}
                  suffix={<TokenSuffix symbol="USDC" />}
                  classNames={{
                    root: cn(
                      "oui-rounded-[4px] oui-rounded-b-sm oui-rounded-tr-xl",
                      "oui-border-none oui-bg-base-6 focus-within:oui-outline-0",
                    ),
                  }}
                />
              </Box>
            </Flex>

            {/* Row 2: Exchange rate + Partner dropdown */}
            <Flex
              justify="between"
              itemAlign="center"
              className={cn(
                "oui-w-full oui-rounded-b-xl oui-rounded-t-[4px]",
                "oui-bg-base-6 oui-px-3 oui-py-2",
              )}
            >
              <Flex itemAlign="center" gap={1}>
                {exchangeRateText && (
                  <QuoteCountdown
                    duration={30}
                    isValidating={quoteIsValidating}
                  />
                )}
                <Text size="2xs" intensity={54} weight="semibold">
                  {exchangeRateText || "—"}
                </Text>
              </Flex>
              {selectedPartner ? (
                <PartnerSelect
                  partners={partners}
                  value={selectedPartner}
                  onValueChange={onPartnerChange}
                  containerRef={formRef}
                />
              ) : isQuoteLoading ? (
                <Spinner size="sm" />
              ) : (
                <Text size="2xs" intensity={36}>
                  No available partner
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>

        {/* ════════════════ CONTINUE BUTTONS ════════════════ */}
        <Flex justify="center" className="oui-w-full oui-pt-7">
          <Box className="oui-w-full lg:oui-w-auto lg:oui-min-w-[184px]">
            <Button
              fullWidth
              size={{ initial: "md", lg: "lg" }}
              onClick={onContinue}
              disabled={isContinueDisabled}
            >
              Continue
            </Button>
          </Box>
        </Flex>
      </Flex>

      {/* ════════════════ ONRAMPER IFRAME FULLSCREEN ════════════════ */}
      {iframeDialogOpen && (
        <DialogPortal>
          <div className="oui-fixed oui-inset-0 oui-z-50 oui-flex oui-flex-col oui-bg-black/80">
            <iframe
              src={onramperIframeUrl}
              title="Onramper Widget"
              allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
              className="oui-w-full oui-flex-1 oui-border-none"
            />
          </div>
        </DialogPortal>
      )}
    </Box>
  );
};

import { useMemo } from "react";
import type { API } from "@orderly.network/types";
import type { FiatCurrency } from "../../constants";
import { useOnrampCheckout } from "../../hooks/useOnrampCheckout";
import { useOnrampQuotes, getOnramperToken } from "../../hooks/useOnrampQuote";
import { useOnrampTransactionStatus } from "../../hooks/useOnrampTransactionStatus";
import type { WebhookEvent } from "../../hooks/useOnrampTransactionStatus";
import { usePartnerPaymentSelection } from "../../hooks/usePartnerPaymentSelection";
import { useReceiveDisplay } from "../../hooks/useReceiveDisplay";
import { useSpendAmount } from "../../hooks/useSpendAmount";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { useChainSelect } from "../chainSelect/useChainSelect";
import type { CurrentChain } from "../chainSelect/useChainSelect";
import type { OnrampPartner } from "../partnerSelect";
import type { PaymentMethod } from "../paymentMethodSelect";

// --- State Return Type ---

export type OnrampFormState = {
  // "You Spend" section
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod) => void;

  fiatCurrencies: readonly string[];
  selectedCurrency: FiatCurrency;
  onCurrencyChange: (currency: FiatCurrency) => void;

  spendAmount: string;
  onSpendAmountChange: (value: string) => void;
  presetAmounts: readonly number[];

  // "You Receive" section
  chains: API.NetworkInfos[];
  selectedChain: CurrentChain | null;
  onChainChange: (chain: API.NetworkInfos) => Promise<void>;

  wallet: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  address?: string;

  receiveQuantity: string;
  receiveQuantityPlaceholder: string;

  partners: OnrampPartner[];
  selectedPartner: OnrampPartner | null;
  onPartnerChange: (partner: OnrampPartner) => void;

  exchangeRateText: string;

  /** True while SWR is fetching/revalidating (for countdown reset). */
  quoteIsValidating: boolean;

  // Availability
  isAvailable: boolean;
  isQuoteLoading: boolean;

  /** Error message when spend amount is outside min/max limits. */
  spendAmountError: string;

  // Onramper checkout (iframe)
  onContinue: () => void;
  isContinueDisabled: boolean;
  // Iframe dialog checkout
  iframeDialogOpen: boolean;
  setIframeDialogOpen: (open: boolean) => void;
  onramperIframeUrl: string;

  // Transaction Status
  statusData: WebhookEvent | null | undefined;
  transactions: WebhookEvent[];
  pendingTransactions: WebhookEvent[];
  historyTransactions: WebhookEvent[];
  isStatusLoading: boolean;
};

// --- Hook ---

export const useOnrampFormScript = (): OnrampFormState => {
  // "You Spend" section
  const spend = useSpendAmount();

  // "You Receive" — chain + network token
  const { chains, currentChain, onChainChange } = useChainSelect();
  const onramperToken = useMemo(
    () => (currentChain ? getOnramperToken(currentChain.id) : undefined),
    [currentChain],
  );

  // Quote fetching (paymentMethodLimits accumulated across fetches)
  const {
    isAvailable,
    partners,
    isLoading,
    getPaymentMethodsForPartner,
    paymentMethodLimits,
    isValidating,
  } = useOnrampQuotes(
    spend.selectedCurrency,
    spend.effectiveSpendAmountForQuote,
    onramperToken,
  );

  // Partner + payment method selection (auto-fallback to first available)
  const selection = usePartnerPaymentSelection(
    partners,
    getPaymentMethodsForPartner,
  );

  // Spend amount validation against accumulated payment method limits
  const spendAmountError = useMemo(() => {
    if (!spend.spendAmount || !selection.selectedPaymentMethod) return "";
    const num = parseFloat(spend.spendAmount);
    if (isNaN(num) || num <= 0) return "";
    const limits = paymentMethodLimits[selection.selectedPaymentMethod.id];
    if (!limits) return "";
    if (num < limits.min || num > limits.max) {
      return `Amount should be in between ${spend.selectedCurrency} ${limits.min} and ${spend.selectedCurrency} ${limits.max}`;
    }
    return "";
  }, [
    spend.spendAmount,
    spend.selectedCurrency,
    selection.selectedPaymentMethod,
    paymentMethodLimits,
  ]);

  // Wallet address (handles AGW chain special case)
  const { wallet, address } = useWalletAddress();

  // Transaction history + polling
  const {
    transactions,
    pendingTransactions,
    historyTransactions,
    isLoading: isStatusLoading,
  } = useOnrampTransactionStatus(address ?? null);

  // Display values for "You Receive" section
  const { receiveQuantity, receiveQuantityPlaceholder, exchangeRateText } =
    useReceiveDisplay({
      spendAmount: spend.spendAmount,
      spendAmountError,
      selectedPartner: selection.selectedPartner,
      selectedCurrency: spend.selectedCurrency,
      effectiveSpendAmountForQuote: spend.effectiveSpendAmountForQuote,
    });

  // Checkout flow (iframe URL, dialog, continue button)
  const checkout = useOnrampCheckout({
    spendAmount: spend.spendAmount,
    selectedCurrency: spend.selectedCurrency,
    spendAmountError,
    onramperToken,
    selectedPartner: selection.selectedPartner,
    selectedPaymentMethod: selection.selectedPaymentMethod,
    address,
    isLoading,
  });

  return {
    paymentMethods: selection.paymentMethods,
    selectedPaymentMethod: selection.selectedPaymentMethod,
    onPaymentMethodChange: selection.onPaymentMethodChange,

    fiatCurrencies: spend.fiatCurrencies,
    selectedCurrency: spend.selectedCurrency,
    onCurrencyChange: spend.onCurrencyChange,

    spendAmount: spend.spendAmount,
    onSpendAmountChange: spend.onSpendAmountChange,
    presetAmounts: spend.presetAmounts,

    chains,
    selectedChain: currentChain,
    onChainChange,

    wallet,
    address,

    receiveQuantity,
    receiveQuantityPlaceholder,

    partners,
    selectedPartner: selection.selectedPartner,
    onPartnerChange: selection.onPartnerChange,

    exchangeRateText,
    quoteIsValidating: isValidating,

    isAvailable,
    isQuoteLoading: isLoading,
    spendAmountError,

    ...checkout,

    statusData:
      pendingTransactions.length > 0
        ? pendingTransactions[0]
        : historyTransactions.length > 0
          ? historyTransactions[0]
          : null,
    transactions,
    pendingTransactions,
    historyTransactions,
    isStatusLoading,
  };
};

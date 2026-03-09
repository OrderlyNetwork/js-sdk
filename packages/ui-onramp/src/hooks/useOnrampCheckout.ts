import { useState, useMemo, useCallback } from "react";
import { toast } from "@orderly.network/ui";
import type { OnrampPartner } from "../components/partnerSelect";
import type { PaymentMethod } from "../components/paymentMethodSelect";
import type { FiatCurrency } from "../constants";
import { buildOnramperIframeUrl } from "../utils/buildOnramperUrl";

/**
 * Manages the onramper checkout flow:
 * iframe URL construction, dialog open state, continue button state, and submit handler.
 */
export function useOnrampCheckout({
  spendAmount,
  selectedCurrency,
  spendAmountError,
  onramperToken,
  selectedPartner,
  selectedPaymentMethod,
  address,
  isLoading,
}: {
  spendAmount: string;
  selectedCurrency: FiatCurrency;
  spendAmountError: string;
  onramperToken: string | undefined;
  selectedPartner: OnrampPartner | null;
  selectedPaymentMethod: PaymentMethod | null;
  address: string | undefined;
  isLoading: boolean;
}) {
  const [iframeDialogOpen, setIframeDialogOpen] = useState(false);

  const onramperIframeUrl = useMemo(
    () =>
      buildOnramperIframeUrl({
        spendAmount,
        selectedCurrency,
        onramperToken,
        selectedPaymentMethod,
        selectedPartner,
        address,
      }),
    [
      spendAmount,
      selectedCurrency,
      onramperToken,
      selectedPaymentMethod,
      selectedPartner,
      address,
    ],
  );

  const isContinueDisabled = useMemo(
    () =>
      !spendAmount ||
      isNaN(parseFloat(spendAmount)) ||
      parseFloat(spendAmount) <= 0 ||
      !selectedCurrency ||
      !onramperToken ||
      !selectedPartner ||
      !selectedPaymentMethod ||
      !address ||
      isLoading ||
      !!spendAmountError,
    [
      spendAmount,
      selectedCurrency,
      spendAmountError,
      onramperToken,
      selectedPartner,
      selectedPaymentMethod,
      address,
      isLoading,
    ],
  );

  const onContinue = useCallback(() => {
    const missing: string[] = [];
    const num = parseFloat(spendAmount);
    if (!spendAmount || isNaN(num) || num <= 0) missing.push("spend amount");
    if (!selectedCurrency) missing.push("fiat currency");
    if (!onramperToken) missing.push("network (chain)");
    if (!selectedPartner) missing.push("partner");
    if (!selectedPaymentMethod) missing.push("payment method");
    if (!address) missing.push("wallet address");

    if (missing.length > 0) {
      const msg = `Missing required info: ${missing.join(", ")}`;
      toast.error(msg);
      console.error("[Onramp] Cannot continue –", msg);
      return;
    }
    setIframeDialogOpen(true);
  }, [
    spendAmount,
    selectedCurrency,
    onramperToken,
    selectedPartner,
    selectedPaymentMethod,
    address,
  ]);

  return {
    onramperIframeUrl,
    iframeDialogOpen,
    setIframeDialogOpen,
    isContinueDisabled,
    onContinue,
  };
}

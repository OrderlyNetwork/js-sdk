import { useMemo } from "react";
import type { OnrampPartner } from "../components/partnerSelect";
import type { FiatCurrency } from "../constants";

/**
 * Derives the "You Receive" section display values from spend + selection state.
 * Encapsulates receiveQuantity, receiveQuantityPlaceholder, and exchangeRateText.
 */
export function useReceiveDisplay({
  spendAmount,
  spendAmountError,
  selectedPartner,
  selectedCurrency,
  effectiveSpendAmountForQuote,
}: {
  spendAmount: string;
  spendAmountError: string;
  selectedPartner: OnrampPartner | null;
  selectedCurrency: FiatCurrency;
  effectiveSpendAmountForQuote: string;
}) {
  const receiveQuantity = useMemo(() => {
    if (spendAmountError) return "";
    const num = parseFloat(spendAmount);
    if (isNaN(num) || num <= 0 || !selectedPartner) return "";
    if (selectedPartner.payout > 0) return selectedPartner.payout.toFixed(2);
    return "0";
  }, [spendAmount, spendAmountError, selectedPartner]);

  const receiveQuantityPlaceholder = useMemo(() => {
    if (!selectedPartner) return "";
    if (selectedPartner.payout > 0) return selectedPartner.payout.toFixed(2);
    if (!selectedPartner.rate) return "";
    const num = parseFloat(effectiveSpendAmountForQuote);
    if (!isNaN(num) && num > 0) return (num / selectedPartner.rate).toFixed(2);
    return "";
  }, [selectedPartner, effectiveSpendAmountForQuote]);

  const exchangeRateText = useMemo(() => {
    if (!selectedPartner?.rate) return "";
    return `1 USDC ≈ ${selectedPartner.rate.toFixed(4)} ${selectedCurrency}`;
  }, [selectedPartner, selectedCurrency]);

  return { receiveQuantity, receiveQuantityPlaceholder, exchangeRateText };
}

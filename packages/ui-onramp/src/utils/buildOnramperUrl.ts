import type { OnrampPartner } from "../components/partnerSelect";
import type { PaymentMethod } from "../components/paymentMethodSelect";
import type { FiatCurrency } from "../constants";
import { ONRAMPER_WIDGET_BASE } from "../constants";
import { ONRAMPER_AUTH, ONRAMPER_SECRET } from "../hooks/useOnrampQuote";
import {
  arrangeStringAlphabetically,
  generateOnramperSignature,
} from "./signOnramperUrl";

export type BuildOnramperUrlParams = {
  spendAmount: string;
  selectedCurrency: FiatCurrency;
  onramperToken: string | undefined;
  selectedPaymentMethod: PaymentMethod | null;
  selectedPartner: OnrampPartner | null;
  address: string | undefined;
};

/**
 * Builds the Onramper widget iframe URL from the given form selections.
 * Signs the `wallets` parameter with HMAC-SHA256 when a secret key is configured.
 */
export function buildOnramperIframeUrl({
  spendAmount,
  selectedCurrency,
  onramperToken,
  selectedPaymentMethod,
  selectedPartner,
  address,
}: BuildOnramperUrlParams): string {
  const params = new URLSearchParams();
  params.set("themeName", "dark");
  params.set("apiKey", ONRAMPER_AUTH);
  params.set("mode", "buy");
  params.set("skipTransactionScreen", "true");
  params.set("txnRedirect", "true");

  if (spendAmount) params.set("txnAmount", spendAmount);
  if (selectedCurrency) params.set("txnFiat", selectedCurrency.toLowerCase());
  if (onramperToken) params.set("txnCrypto", onramperToken);
  if (selectedPaymentMethod)
    params.set("txnPaymentMethod", selectedPaymentMethod.id);
  if (selectedPartner) params.set("txnOnramp", selectedPartner.id);

  // Wallets param: lowercased per Onramper spec, then HMAC-SHA256 signed
  if (address && onramperToken) {
    const walletsValue = `${onramperToken}:${address}`.toLowerCase();
    params.set("wallets", walletsValue);

    if (ONRAMPER_SECRET) {
      const signContent = arrangeStringAlphabetically(
        `wallets=${walletsValue}`,
      );
      const signature = generateOnramperSignature(ONRAMPER_SECRET, signContent);
      params.set("signature", signature);
    }
  }

  return `${ONRAMPER_WIDGET_BASE}?${params.toString()}`;
}

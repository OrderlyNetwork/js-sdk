import { useEffect, useMemo, useState } from "react";
import { useSWR } from "@orderly.network/hooks";
import type { OnrampPartner } from "../components/partnerSelect";
import type { PaymentMethod } from "../components/paymentMethodSelect";

const ONRAMPER_BASE = "https://api.onramper.com/quotes";
export const ONRAMPER_AUTH = "pk_prod_01JWTGETB1H32953X7KR3DSH1S";
// export const ONRAMPER_AUTH = "pk_prod_01HETEQF46GSK6BS5JWKDF31BT";
export const ONRAMPER_SECRET = "01JWTGETB259KDVKEEVHBCGT7D"; // TODO: enter your Onramper signing secret key

/** Maps chain IDs to Onramper USDC token identifiers. */
const CHAIN_TO_ONRAMPER_TOKEN: Record<number, string> = {
  1: "usdc_ethereum", // Ethereum
  10: "usdc_optimism", // Optimism
  56: "usdc_bsc", // BNB Smart Chain
  100: "usdc_gnosis", // Gnosis
  137: "usdc_polygon", // Polygon
  143: "usdc_monad", // Monad Mainnet
  324: "usdc_zksync", // zkSync Era
  2020: "usdc_ronin", // Ronin
  8453: "usdc_base", // Base
  42161: "usdc_arbitrum", // Arbitrum One
  42220: "usdc_celo", // Celo
  43114: "usdc_avaxc", // Avalanche C-Chain
  57073: "usdc_ink", // Ink
  59144: "usdc_linea", // Linea
  900900900: "usdc_solana", // Solana Mainnet
};

export const ONRAMP_SUPPORTED_CHAIN_IDS = new Set(
  Object.keys(CHAIN_TO_ONRAMPER_TOKEN).map(Number),
);

export function getOnramperToken(chainId: number): string | undefined {
  return CHAIN_TO_ONRAMPER_TOKEN[chainId];
}

export type OnrampQuotePaymentMethod = {
  paymentTypeId: string;
  name: string;
  icon: string;
  details: {
    currencyStatus: string;
    limits: Record<string, { min: number; max: number }>;
  };
};

export type OnrampQuoteError = {
  type: string;
  errorId: number;
  message: string;
  onramp?: string;
  parameter?: string;
  value?: string;
  name: string;
};

export type OnrampQuoteItem = {
  rate?: number;
  networkFee?: number;
  transactionFee?: number;
  payout?: number;
  availablePaymentMethods?: OnrampQuotePaymentMethod[];
  ramp: string;
  paymentMethod?: string;
  quoteId: string;
  errors?: OnrampQuoteError[];
  recommendations?: string[];
};

const onrampFetcher = async (url: string): Promise<OnrampQuoteItem[]> => {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: ONRAMPER_AUTH,
    },
  });
  if (!res.ok) {
    throw new Error(`Onramper API error: ${res.status}`);
  }
  return res.json();
};

const buildQuoteUrl = (
  currency: string,
  amount: number | string,
  onramperToken: string,
): string =>
  `${ONRAMPER_BASE}/${currency.toLowerCase()}/${onramperToken}?amount=${amount}`;

function filterValidRamps(items: OnrampQuoteItem[]): OnrampQuoteItem[] {
  return items.filter((item) => !item.errors);
}

function toPartners(items: OnrampQuoteItem[]): OnrampPartner[] {
  return items.map((item) => ({
    id: item.ramp,
    name: item.ramp.charAt(0).toUpperCase() + item.ramp.slice(1),
    rate: item.rate ?? 0,
    payout: item.payout ?? 0,
    recommendations: item.recommendations ?? [],
  }));
}

function toPaymentMethods(items: OnrampQuoteItem[]): PaymentMethod[] {
  const seen = new Set<string>();
  const methods: PaymentMethod[] = [];
  for (const item of items) {
    if (!item.availablePaymentMethods) continue;
    for (const pm of item.availablePaymentMethods) {
      if (!seen.has(pm.paymentTypeId)) {
        seen.add(pm.paymentTypeId);
        methods.push({
          id: pm.paymentTypeId,
          name: pm.name,
          icon: pm.icon,
        });
      }
    }
  }
  return methods;
}

function getPaymentMethodsForPartner(
  items: OnrampQuoteItem[],
  partnerId: string,
): PaymentMethod[] {
  const item = items.find((i) => i.ramp === partnerId);
  if (!item?.availablePaymentMethods) return [];
  return item.availablePaymentMethods.map((pm) => ({
    id: pm.paymentTypeId,
    name: pm.name,
    icon: pm.icon,
  }));
}

/** paymentMethodId → { min, max } (from aggregatedLimit) */
export type PaymentMethodLimitsMap = Record<
  string,
  { min: number; max: number }
>;

function extractAllLimits(items: OnrampQuoteItem[]): PaymentMethodLimitsMap {
  const result: PaymentMethodLimitsMap = {};
  for (const item of items) {
    if (!item.availablePaymentMethods) continue;
    for (const pm of item.availablePaymentMethods) {
      const agg = pm.details?.limits?.aggregatedLimit;
      if (agg && !result[pm.paymentTypeId]) {
        result[pm.paymentTypeId] = agg;
      }
    }
  }
  return result;
}

const DEFAULT_AMOUNT = 100;
export function useOnrampQuotes(
  currency: string,
  amount?: string,
  onramperToken?: string,
) {
  const token = onramperToken || "";
  const num = amount ? parseFloat(amount) : NaN;
  const effectiveAmount = !isNaN(num) && num > 0 ? num : DEFAULT_AMOUNT;
  const url = buildQuoteUrl(currency, effectiveAmount, token);

  const { data, error, isLoading, isValidating } = useSWR<OnrampQuoteItem[]>(
    `onramp-quote-${currency.toLowerCase()}-${effectiveAmount}-${token}`,
    () => onrampFetcher(url),
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      dedupingInterval: 1_000,
      keepPreviousData: true,
    },
  );

  const validRamps = useMemo(
    () => (data ? filterValidRamps(data) : []),
    [data],
  );

  const isAvailable = validRamps.length > 0 && !error;

  const partners = useMemo(() => toPartners(validRamps), [validRamps]);
  const paymentMethods = useMemo(
    () => toPaymentMethods(validRamps),
    [validRamps],
  );
  const latestLimits = useMemo(
    () => extractAllLimits(validRamps),
    [validRamps],
  );

  // Accumulate limits across fetches so they persist even when we stop querying
  const [accumulatedLimits, setAccumulatedLimits] =
    useState<PaymentMethodLimitsMap>({});

  useEffect(() => {
    if (Object.keys(latestLimits).length > 0) {
      setAccumulatedLimits((prev) => ({ ...prev, ...latestLimits }));
    }
  }, [latestLimits]);

  return {
    isAvailable,
    partners,
    paymentMethods,
    paymentMethodLimits: accumulatedLimits,
    isLoading,
    error,
    validRamps,
    isValidating,
    getPaymentMethodsForPartner: (partnerId: string) =>
      getPaymentMethodsForPartner(validRamps, partnerId),
  };
}

export function useOnrampAvailability(currency: string) {
  return useOnrampQuotes(currency);
}

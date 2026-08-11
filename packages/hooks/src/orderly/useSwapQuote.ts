import { useMemo, useState } from "react";
import { useMemoizedFn } from "../shared/useMemoizedFn";
import { useMutation } from "../useMutation";
import {
  normalizeSwapQuoteResponse,
  isSwapQuoteData,
  SWAP_QUOTE_URL,
  unwrapSwapQuoteResponse,
  type SwapQuoteError,
  type SwapQuoteRequest,
  type SwapQuoteResponse,
} from "./swapQuote";

export {
  normalizeSwapQuoteResponse,
  isSwapQuoteData,
  SWAP_QUOTE_URL,
  unwrapSwapQuoteResponse,
} from "./swapQuote";
export type {
  GasEstimate,
  SwapQuoteData,
  SwapQuoteError,
  SwapQuoteRequest,
  SwapQuoteResponse,
  SwapQuoteToken,
} from "./swapQuote";

export const useSwapQuote = () => {
  const [trigger, { data, reset, isMutating }] = useMutation<
    SwapQuoteResponse,
    SwapQuoteError
  >(SWAP_QUOTE_URL);
  const [quoteError, setQuoteError] = useState<SwapQuoteError>();

  const postQuote = useMemoizedFn(async (request: SwapQuoteRequest | null) => {
    setQuoteError(undefined);

    try {
      return await trigger(request).then(normalizeSwapQuoteResponse);
    } catch (requestError) {
      setQuoteError(requestError as SwapQuoteError);
      throw requestError;
    }
  });

  const resetQuote = useMemoizedFn(() => {
    reset();
    setQuoteError(undefined);
  });

  const quoteData = useMemo(() => {
    const quote = unwrapSwapQuoteResponse(
      data as SwapQuoteResponse | undefined,
    );
    return quote && isSwapQuoteData(quote) ? quote : undefined;
  }, [data]);

  return [
    postQuote,
    {
      data: quoteData,
      error: quoteError,
      reset: resetQuote,
      isMutating,
    },
  ] as const;
};

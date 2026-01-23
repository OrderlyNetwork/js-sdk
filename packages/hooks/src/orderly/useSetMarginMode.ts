import { MarginMode } from "@orderly.network/types";
import { useMutation } from "../useMutation";

export type SetMarginModePayload = {
  symbol_list: string[];
  default_margin_mode: MarginMode;
};

/**
 * A hook to update margin mode for one or multiple symbols.
 *
 * @example
 * ```ts
 * const { setMarginMode, isMutating } = useSetMarginMode();
 *
 * await setMarginMode({
 *   symbol_list: ["PERP_BTC_USDC"],
 *   default_margin_mode: MarginMode.CROSS,
 * });
 * ```
 */
export const useSetMarginMode = () => {
  const [setMarginModeInternal, { isMutating }] = useMutation(
    "/v1/client/margin_mode",
    "POST",
  );

  return {
    setMarginMode: setMarginModeInternal as (
      payload: SetMarginModePayload,
    ) => Promise<any>,
    isMutating,
  };
};

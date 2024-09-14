import { utils } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { BasicSymbolInfo } from "../types/types";

export const getBasicSymbolInfo = (
  symbolInfo: (
    key?: keyof API.SymbolExt | undefined,
    defaultValue?: utils.ValueOf<API.SymbolExt> | undefined
  ) => any
): BasicSymbolInfo => {
  return {
    base_dp: symbolInfo("base_dp"),
    quote_dp: symbolInfo("quote_dp"),
    base_tick: symbolInfo("base_tick"),
    base: symbolInfo("base"),
    quote: symbolInfo("quote"),
  };
};

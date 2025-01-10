import { FC } from "react";
import { MarketsProviderProps } from "../marketsProvider";
import {
  useSymbolInfoBarFullScript,
  UseSymbolInfoBarFullScriptOptions,
} from "./symbolInfoBarFull.script";
import {
  SymbolInfoBarFull,
  SymbolInfoBarFullProps,
} from "./symbolInfoBarFull.ui";

export type SymbolInfoBarFullWidgetPros = UseSymbolInfoBarFullScriptOptions &
  Pick<SymbolInfoBarFullProps, "className" | "trailing"> &
  Pick<MarketsProviderProps, "onSymbolChange">;

export const SymbolInfoBarFullWidget: FC<SymbolInfoBarFullWidgetPros> = (
  props
) => {
  const { symbol, ...rest } = props;

  const state = useSymbolInfoBarFullScript({ symbol });
  return <SymbolInfoBarFull {...state} {...rest} />;
};

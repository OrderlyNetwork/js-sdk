import { FC } from "react";
import { MarketsProviderProps } from "../marketsProvider";
import {
  useTokenInfoBarFullScript,
  UseTokenInfoBarFullScriptOptions,
} from "./tokenInfoBarFull.script";
import { TokenInfoBarFull, TokenInfoBarFullProps } from "./tokenInfoBarFull.ui";

export type TokenInfoBarFullWidgetPros = UseTokenInfoBarFullScriptOptions &
  Pick<TokenInfoBarFullProps, "className" | "trailing"> &
  Pick<MarketsProviderProps, "onSymbolChange">;

export const TokenInfoBarFullWidget: FC<TokenInfoBarFullWidgetPros> = (
  props
) => {
  const { symbol, ...rest } = props;

  const state = useTokenInfoBarFullScript({ symbol, deps: [props.trailing] });
  return <TokenInfoBarFull {...state} {...rest} />;
};

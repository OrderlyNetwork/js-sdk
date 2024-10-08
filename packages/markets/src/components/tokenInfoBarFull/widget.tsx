import { MarketsProviderProps } from "../marketsProvider";
import {
  useTokenInfoBarFullScript,
  UseTokenInfoBarFullScriptOptions,
} from "./tokenInfoBarFull.script";
import { TokenInfoBarFull, TokenInfoBarFullProps } from "./tokenInfoBarFull.ui";

export type TokenInfoBarFullWidgetPros = UseTokenInfoBarFullScriptOptions &
  Pick<TokenInfoBarFullProps, "className" | "trailing"> &
  Pick<MarketsProviderProps, "onSymbolChange">;

export const TokenInfoBarFullWidget: React.FC<TokenInfoBarFullWidgetPros> = (
  props
) => {
  const { symbol, ...rest } = props;

  const state = useTokenInfoBarFullScript({ symbol });
  return <TokenInfoBarFull {...state} {...rest} />;
};

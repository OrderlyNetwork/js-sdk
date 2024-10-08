import {
  useTokenInfoBarScript,
  UseTokenInfoBarScriptOptions,
} from "./tokenInfoBar.script";
import { TokenInfoBar, TokenInfoBarProps } from "./tokenInfoBar.ui";

export type TokenInfoBarWidgetPros = UseTokenInfoBarScriptOptions &
  Pick<TokenInfoBarProps, "className" | "trailing" | "onSymbol">;

export const TokenInfoBarWidget: React.FC<TokenInfoBarWidgetPros> = (props) => {
  const { symbol, ...rest } = props;

  const state = useTokenInfoBarScript({ symbol });
  return <TokenInfoBar {...state} {...rest} />;
};

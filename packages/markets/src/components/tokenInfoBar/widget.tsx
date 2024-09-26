import {
  useTokenInfoBarScript,
  UseTokenInfoBarScriptOptions,
} from "./tokenInfoBar.script";
import { TokenInfoBar, TokenInfoBarProps } from "./tokenInfoBar.ui";

export type TokenInfoBarWidgetPros = UseTokenInfoBarScriptOptions &
  Pick<TokenInfoBarProps, "layout" | "onLayout" | "className">;

export const TokenInfoBarWidget: React.FC<TokenInfoBarWidgetPros> = (props) => {
  const state = useTokenInfoBarScript({ symbol: props.symbol });
  return (
    <TokenInfoBar
      {...state}
      layout={props.layout}
      onLayout={props.onLayout}
      className={props.className}
    />
  );
};

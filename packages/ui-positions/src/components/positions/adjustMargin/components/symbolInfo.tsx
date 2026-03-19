import { FC } from "react";
import { Text, TokenIcon } from "@orderly.network/ui";

export interface SymbolInfoProps {
  symbol: string;
}

export const SymbolInfo: FC<SymbolInfoProps> = ({ symbol }) => {
  return (
    <div className="oui-flex oui-items-center oui-gap-2">
      <TokenIcon symbol={symbol} className="oui-size-5" />
      <Text.formatted
        rule="symbol"
        formatString="base-type"
        size="base"
        weight="semibold"
        intensity={98}
      >
        {symbol}
      </Text.formatted>
    </div>
  );
};

import { memo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { Text, FormattedTextProps, TokenIcon, Flex } from "@orderly.network/ui";

type SymbolDisplayProps = FormattedTextProps;

export const SymbolDisplay = memo((props: SymbolDisplayProps) => {
  const { children, size = "xs", ...rest } = props;
  const symbol = children as string;

  const symbolsInfo = useSymbolsInfo();
  const displayName = symbolsInfo[symbol]("displayName");

  if (displayName) {
    return (
      <Flex gapX={1} className={props.className}>
        {props.showIcon && <TokenIcon size={size as any} symbol={symbol} />}
        <Text
          size="xs"
          weight="semibold"
          className="oui-whitespace-nowrap oui-break-normal"
        >
          {displayName}
        </Text>
      </Flex>
    );
  }

  return (
    <Text.formatted size="xs" rule="symbol" weight="semibold" {...rest}>
      {symbol}
    </Text.formatted>
  );
});

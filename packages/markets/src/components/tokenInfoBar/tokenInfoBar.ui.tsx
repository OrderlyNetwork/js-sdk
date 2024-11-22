import { FC, ReactNode } from "react";
import { Flex, Text, cn, Divider, Badge } from "@orderly.network/ui";
import { UseTokenInfoBarScriptReturn } from "./tokenInfoBar.script";
import { TriangleDownIcon } from "../../icons";
import { Decimal } from "@orderly.network/utils";
import { MarketsProviderProps } from "../marketsProvider";

export type Layout = "left" | "right";

export type TokenInfoBarProps = Pick<MarketsProviderProps, "onSymbolChange"> &
  UseTokenInfoBarScriptReturn & {
    className?: string;
    trailing?: ReactNode;
    onSymbol?: () => void;
  };

export const TokenInfoBar: FC<TokenInfoBarProps> = (props) => {
  const { symbol, data, leverage, onSymbol } = props;

  const symbolView = (
    <Flex className="oui-cursor-pointer oui-gap-x-[6px]" onClick={onSymbol}>
      <Text.formatted
        className="oui-break-normal oui-whitespace-nowrap"
        rule="symbol"
        formatString="base-type"
        size="sm"
        weight="semibold"
        showIcon
      >
        {symbol}
      </Text.formatted>
      <TriangleDownIcon className="oui-text-base-contrast-54 oui-w-[14px] oui-h-[14px]" />
    </Flex>
  );

  return (
    <Flex className={cn("oui-font-semibold oui-h-full", props.className)}>
      <Flex gapX={3} className="oui-flex-1 oui-overflow-hidden oui-h-full">
        <Flex gapX={3}>
          {symbolView}
          <Badge size="xs" color="primary">
            {leverage}x
          </Badge>
        </Flex>

        <Divider className="oui-h-6" direction="vertical" intensity={8} />
        <Text.numeral
          size="2xs"
          rule="percentages"
          coloring
          rm={Decimal.ROUND_DOWN}
          showIdentifier
        >
          {data?.["change"]!}
        </Text.numeral>
      </Flex>
      {props.trailing}
    </Flex>
  );
};

import { FC, ReactNode } from "react";
import { Flex, Text, cn, Divider, Badge, TokenIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { TriangleDownIcon } from "../../icons";
import { MarketsProviderProps } from "../marketsProvider";
import { RwaTooltip } from "../symbolInfoBarFull/rwaTooltip";
import { UseSymbolInfoBarScriptReturn } from "./symbolInfoBar.script";

export type Layout = "left" | "right";

export type SymbolInfoBarProps = Pick<MarketsProviderProps, "onSymbolChange"> &
  UseSymbolInfoBarScriptReturn & {
    className?: string;
    trailing?: ReactNode;
    onSymbol?: () => void;
  };

export const SymbolInfoBar: FC<SymbolInfoBarProps> = (props) => {
  const {
    symbol,
    data,
    leverage,
    onSymbol,
    isRwa,
    open,
    closeTimeInterval,
    openTimeInterval,
  } = props;

  const symbolView = (
    <Flex
      className="oui-cursor-pointer oui-gap-x-[6px] oui-h-5"
      onClick={onSymbol}
    >
      <Text.formatted
        className="oui-break-normal oui-whitespace-nowrap"
        rule="symbol"
        formatString="base-type"
        size="sm"
        weight="semibold"
      >
        {symbol}
      </Text.formatted>
      <TriangleDownIcon className="oui-text-base-contrast-54 oui-w-[14px] oui-h-[14px]" />
    </Flex>
  );

  return (
    <Flex
      className={cn(
        "oui-symbol-info-bar-mobile",
        "oui-font-semibold oui-h-full",
        props.className,
      )}
    >
      <Flex gapX={3} className="oui-flex-1 oui-overflow-hidden oui-h-full">
        <Flex gapX={3}>
          <TokenIcon symbol={symbol} size="xs" />
          <Flex direction="column" itemAlign="start">
            {symbolView}
            <Flex gap={1}>
              <Badge size="xs" color="primary">
                {leverage}x
              </Badge>
              <RwaTooltip
                isRwa={isRwa}
                open={open}
                closeTimeInterval={closeTimeInterval}
                openTimeInterval={openTimeInterval}
              />
            </Flex>
          </Flex>
        </Flex>

        <Divider className="oui-h-[38px]" direction="vertical" intensity={8} />
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

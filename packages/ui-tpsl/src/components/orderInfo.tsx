import {
  useIndexPrice,
  useMarkPrice,
  useSymbolLeverage,
} from "@orderly.network/hooks";
import { OrderlyOrder } from "@orderly.network/types";
import { cn, Flex, Grid, Text, TokenIcon } from "@orderly.network/ui";

type Props = {
  order: Partial<OrderlyOrder>;
  baseDP?: number;
  quoteDP?: number;
  className?: string;
};
export const OrderInfo = (props: Props) => {
  const { order } = props;
  const { symbol, side } = order;
  const markPrice = useMarkPrice(symbol!);
  const indexPrice = useIndexPrice(symbol!);
  const symbolLeverage = useSymbolLeverage(symbol!);
  return (
    <Flex
      direction={"column"}
      gap={2}
      itemAlign={"start"}
      className={cn(props.className, "oui-w-full")}
    >
      <Flex gap={2} itemAlign={"center"}>
        <Flex gap={1} itemAlign={"center"}>
          <TokenIcon symbol={symbol} className="oui-w-5 oui-h-5" />
          <Text.formatted
            className="oui-break-normal oui-whitespace-nowrap"
            rule="symbol"
            formatString="base-type"
            size="sm"
            weight="semibold"
            intensity={98}
          >
            {symbol}
          </Text.formatted>
        </Flex>
        <Text
          size="2xs"
          className="oui-text-base-contrast-36 oui-h-[18px] oui-px-2 oui-bg-base-7 oui-rounded"
        >
          {symbolLeverage}x
        </Text>
      </Flex>
      <Grid cols={2} gapX={2} gapY={1} className="oui-w-full">
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Quantity </Text>
          <Text.numeral
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
            dp={props.baseDP ?? 2}
          >
            {Number(order.order_quantity)}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Last price </Text>
          <Text.numeral
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
            dp={props.quoteDP ?? 2}
          >
            {indexPrice?.data}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Order price </Text>
          <Text.numeral
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
            dp={props.quoteDP ?? 2}
          >
            {Number(order.order_price)}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Mark price </Text>
          <Text.numeral
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
            dp={props.quoteDP ?? 2}
          >
            {markPrice?.data}
          </Text.numeral>
        </Flex>
      </Grid>
    </Flex>
  );
};

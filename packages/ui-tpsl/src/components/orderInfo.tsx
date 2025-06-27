import {
  useIndexPrice,
  useMarkPrice,
  useSymbolLeverage,
} from "@orderly.network/hooks";
import { OrderlyOrder } from "@orderly.network/types";
import { Flex, Grid, Text, TokenIcon } from "@orderly.network/ui";

type Props = {
  order: OrderlyOrder;
};
export const OrderInfo = (props: Props) => {
  const { order } = props;
  const { symbol, side } = order;
  const markPrice = useMarkPrice(symbol);
  const indexPrice = useIndexPrice(symbol);
  const symbolLeverage = useSymbolLeverage(symbol);
  return (
    <Flex direction={"column"} gap={2} itemAlign={"start"}>
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
          <Text.formatted
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
          >
            {order.order_quantity}
          </Text.formatted>
        </Flex>
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Last price </Text>
          <Text.formatted
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
          >
            {indexPrice?.data}
          </Text.formatted>
        </Flex>
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Order price </Text>
          <Text.formatted
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
          >
            {order.order_price}
          </Text.formatted>
        </Flex>
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">Mark price </Text>
          <Text.formatted
            rule="price"
            className="oui-text-base-contrast-80"
            size="2xs"
          >
            {markPrice?.data}
          </Text.formatted>
        </Flex>
      </Grid>
    </Flex>
  );
};

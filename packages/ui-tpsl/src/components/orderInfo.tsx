import {
  useIndexPrice,
  useMarkPrice,
  useSymbolLeverage,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { OrderlyOrder } from "@orderly.network/types";
import { cn, Flex, Grid, Text, TokenIcon } from "@orderly.network/ui";

type Props = {
  order: Partial<OrderlyOrder>;
  baseDP?: number;
  quoteDP?: number;
  className?: string;
  classNames?: {
    root?: string;
    symbol?: string;
    container?: string;
  };
};
export const OrderInfo = (props: Props) => {
  const { t } = useTranslation();
  const { order } = props;
  const { symbol, side } = order;
  const markPrice = useMarkPrice(symbol!);
  const indexPrice = useIndexPrice(symbol!);
  const symbolLeverage = useSymbolLeverage(symbol!);
  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className={cn(
        "oui-w-full oui-gap-3 oui-font-semibold ",
        props.classNames?.root,
      )}
    >
      <Flex
        itemAlign={"center"}
        className={cn("oui-gap-2 ", props.classNames?.symbol)}
      >
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
          className="oui-text-base-contrast-36 oui-h-[18px] oui-px-2 oui-bg-base-7 oui-rounded oui-font-semibold"
        >
          {symbolLeverage}x
        </Text>
      </Flex>
      <Grid
        cols={2}
        gapX={2}
        gapY={1}
        className={cn("oui-w-full oui-gap-x-2 ", props.classNames?.container)}
      >
        <Flex justify={"between"} className=" oui-text-base-contrast-36">
          <Text size="2xs">{t("tpsl.advanced.quantity")}</Text>
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
          <Text size="2xs">{t("tpsl.advanced.lastPrice")}</Text>
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
          <Text size="2xs">{t("tpsl.advanced.orderPrice")}</Text>
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
          <Text size="2xs">{t("common.markPrice")}</Text>
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

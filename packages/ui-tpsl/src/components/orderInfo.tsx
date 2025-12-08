import {
  useIndexPrice,
  useMarkPrice,
  useLeverageBySymbol,
} from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { OrderlyOrder } from "@veltodefi/types";
import { cn, Flex, Grid, Text, TokenIcon } from "@veltodefi/ui";

type Props = {
  order: Partial<OrderlyOrder>;
  baseDP?: number;
  quoteDP?: number;
  estLiqPrice?: number;
  className?: string;
  classNames?: {
    root?: string;
    symbol?: string;
    container?: string;
  };
  symbolLeverage?: number;
};
export const OrderInfo = (props: Props) => {
  const { t } = useTranslation();
  const { order, symbolLeverage } = props;
  const { symbol } = order;
  const markPrice = useMarkPrice(symbol!);
  const indexPrice = useIndexPrice(symbol!);

  const leverage = useLeverageBySymbol(symbolLeverage ? undefined : symbol);

  const currentLeverage = symbolLeverage || leverage;

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
          <TokenIcon symbol={symbol} className="oui-size-5" />
          <Text.formatted
            className="oui-whitespace-nowrap oui-break-normal"
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
          className="oui-h-[18px] oui-rounded oui-bg-base-7 oui-px-2 oui-font-semibold oui-text-base-contrast-36"
        >
          {currentLeverage}x
        </Text>
      </Flex>
      <Grid
        cols={2}
        gapX={2}
        gapY={1}
        className={cn("oui-w-full oui-gap-x-2 ", props.classNames?.container)}
      >
        <Flex justify={"between"} className=" oui-text-base-contrast-36">
          <Text size="2xs">{t("common.quantity")}</Text>
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
          <Text size="2xs">{t("common.lastPrice")}</Text>
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
          <Text size="2xs">{t("common.orderPrice")}</Text>
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
        <Flex justify={"between"} className="oui-text-base-contrast-36">
          <Text size="2xs">{t("positions.column.liqPrice")}</Text>
          <Text.numeral
            rule="price"
            className="oui-text-warning"
            size="2xs"
            dp={props.quoteDP ?? 2}
          >
            {props.estLiqPrice ?? "--"}
          </Text.numeral>
        </Flex>
      </Grid>
    </Flex>
  );
};

import { FC, ReactNode, useMemo } from "react";
import { HeaderReturns } from "./header.script";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useMarketsContext } from "../../../components/marketsProvider";
import { OrderlyIcon } from "../../../icons";

/** -----------MarketsHeader start ------------ */
export const MarketsHeader: FC<HeaderReturns> = (props) => {
  const {
    emblaRef,
    emblaApi,
    scrollIndex,
    enableScroll,
    news,
    gainers,
    losers,
    total24Amount,
    totalOpenInterest,
    tvl,
    favorite,
  } = props;
  const { onSymbolChange } = useMarketsContext();

  const cls = cn(
    "oui-flex-[0_0_calc((100%_-_32px)_/_3)] 3xl:oui-flex-[0_0_calc((100%_-_48px)_/_4)] oui-min-w-0",
    enableScroll && "oui-select-none oui-cursor-pointer"
  );

  const onSymbol = (item: any) => {
    onSymbolChange?.(item);
    favorite.addToHistory(item);
  };

  return (
    <div
      id="oui-markets-header"
      className="oui-overflow-hidden"
      ref={enableScroll ? emblaRef : undefined}
    >
      <Flex width="100%" gapX={4} mt={4}>
        <BlockList
          total24Amount={total24Amount}
          totalOpenInterest={totalOpenInterest}
          tvl={tvl}
          className={cls}
        />
        <CardItem
          data={news}
          title={<Text.gradient color="brand">New listings</Text.gradient>}
          className={cls}
          onSymbol={onSymbol}
        />
        <CardItem
          data={gainers}
          title={<Text className="oui-text-success-light">Top gainers</Text>}
          className={cls}
          onSymbol={onSymbol}
        />
        <CardItem
          data={losers}
          title={<Text className="oui-text-danger-light">Top losers</Text>}
          className={cls}
          onSymbol={onSymbol}
        />
      </Flex>
      <div className="oui-mt-1 oui-mb-3  3xl:oui-mt-4 3xl:oui-mb-0">
        <ScrollIndicator
          scrollIndex={scrollIndex}
          scrollPrev={emblaApi?.scrollPrev}
          scrollNext={emblaApi?.scrollNext}
        />
      </div>
    </div>
  );
};
/** -----------MarketsHeader end ------------ */

type BlockListProps = {
  className?: string;
  total24Amount?: number;
  totalOpenInterest?: number;
  tvl?: number;
};

/** -----------MarketsHeader start ------------ */
const BlockList: React.FC<BlockListProps> = (props) => {
  const { total24Amount, totalOpenInterest, tvl } = props;

  const list = useMemo(() => {
    return [
      {
        label: (
          <Flex gapX={1}>
            <OrderlyIcon /> 24h volume
          </Flex>
        ),
        value: total24Amount,
      },
      {
        label: "Open interest",
        value: totalOpenInterest,
      },
      {
        label: "Assets (TVL)",
        value: tvl,
      },
    ];
  }, [total24Amount, totalOpenInterest, tvl]);
  return (
    <Flex
      direction="column"
      justify="between"
      width="100%"
      height={236}
      className={props.className}
    >
      {list?.map((item, index) => (
        <BlockItem key={index} {...item} />
      ))}
    </Flex>
  );
};
/** -----------MarketsHeader start ------------ */

type BlockItemProps = {
  label: ReactNode;
  value?: number;
  rule?: string;
  dp?: number;
};

const BlockItem: React.FC<BlockItemProps> = (props) => {
  return (
    <Box intensity={900} r="lg" px={4} py={3} width="100%">
      <Text as="div" intensity={36} size="xs" weight="semibold">
        {props.label}
      </Text>

      <Text.numeral
        size="base"
        currency="$"
        dp={props.dp || 0}
        rm={Decimal.ROUND_DOWN}
        rule={props.rule as any}
      >
        {props.value!}
      </Text.numeral>
    </Box>
  );
};

type CardItemProps = {
  data?: TListItem[];
  title: ReactNode;
  className?: string;
  onSymbol: (item: any) => void;
};

const CardItem: React.FC<CardItemProps> = (props) => {
  return (
    <Box
      intensity={900}
      r="lg"
      py={4}
      pb={2}
      height={236}
      className={props.className}
    >
      <Box px={4}>
        <Text.gradient color="brand" size="sm" weight="semibold">
          {props.title}
        </Text.gradient>
      </Box>

      <Flex direction="column" itemAlign="start" mt={2}>
        {props.data?.map((item, index) => (
          <ListItem key={item.symbol} item={item} onSymbol={props.onSymbol} />
        ))}
      </Flex>
    </Box>
  );
};

type TListItem = {
  symbol: string;
  price: string;
  change: number;
  precision: number;
  [x: string]: any;
};

type ListItemProps = {
  item: TListItem;
  className?: string;
  onSymbol: (item: any) => void;
};

const ListItem: React.FC<ListItemProps> = (props) => {
  const { item } = props;

  return (
    <Flex
      width="100%"
      gapX={3}
      py={2}
      px={4}
      className={cn("hover:oui-bg-base-8 oui-cursor-pointer", props.className)}
      onClick={() => {
        props.onSymbol(item);
      }}
    >
      <Flex width="100%" gapX={1}>
        {/* <TokenIcon symbol={item.symbol} size="xs" /> */}
        <Text.formatted
          rule="symbol"
          formatString="base"
          size="xs"
          weight="semibold"
          showIcon
        >
          {item.symbol}
        </Text.formatted>
      </Flex>

      <Flex width="100%" justify="end">
        <Text.numeral
          currency="$"
          size="xs"
          weight="semibold"
          dp={item.quote_dp}
        >
          {item["24h_close"]}
        </Text.numeral>
      </Flex>

      <Flex width="100%" justify="end">
        <Text.numeral
          rule="percentages"
          coloring
          size="xs"
          weight="semibold"
          showIdentifier
        >
          {item.change}
        </Text.numeral>
      </Flex>
    </Flex>
  );
};

interface ScrollIndicatorProps {
  scrollIndex: number;
  scrollPrev?: () => void;
  scrollNext?: () => void;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = (props) => {
  const { scrollIndex, scrollPrev, scrollNext } = props;

  return (
    <Flex gapX={1} justify="center" className="3xl:oui-hidden">
      {[0, 1].map((item) => {
        return (
          <Box
            key={item}
            py={1}
            pl={item === 0 ? 1 : 0}
            pr={item === 1 ? 1 : 0}
            onClick={() => {
              if (scrollIndex === 0 && item === 1) {
                scrollNext?.();
              } else if (scrollIndex === 1 && item === 0) {
                scrollPrev?.();
              }
            }}
            className="oui-cursor-pointer"
          >
            <Box
              key={item}
              width={8}
              height={4}
              r="full"
              className={cn(
                "oui-transition-all oui-duration-300",
                scrollIndex === item
                  ? "oui-bg-base-contrast-36 oui-w-4"
                  : "oui-bg-base-contrast-20"
              )}
            />
          </Box>
        );
      })}
    </Flex>
  );
};

export default ScrollIndicator;

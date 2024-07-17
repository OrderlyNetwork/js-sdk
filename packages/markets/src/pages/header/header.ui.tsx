import { FC, ReactNode, useMemo } from "react";
import { HeaderReturns } from "./header.script";
import { Box, cn, Flex, Text } from "@orderly.network/ui";

/** -----------MarketsHeader start ------------ */
export const MarketsHeader: FC<HeaderReturns> = (props) => {
  const {
    emblaRef,
    emblaApi,
    scrollIndex,
    news,
    gainers,
    losers,
    total24Amount,
    totalOpenInterest,
  } = props;
  const cls =
    "oui-flex-[0_0_calc((100%_-_32px)_/_3)] oui-min-w-0 oui-select-none oui-cursor-pointer";

  return (
    <div className="oui-overflow-hidden" ref={emblaRef}>
      <Flex width="100%" gapX={4} mt={4}>
        <BlockList
          total24Amount={total24Amount}
          totalOpenInterest={totalOpenInterest}
          className={cls}
        />
        <CardItem
          data={news}
          title={<Text.gradient color="brand">New listings</Text.gradient>}
          className={cls}
        />
        <CardItem
          data={gainers}
          title={<Text className="oui-text-success-light">Top gainers</Text>}
          className={cls}
        />
        <CardItem
          data={losers}
          title={<Text className="oui-text-danger-light">Top losers</Text>}
          className={cls}
        />
      </Flex>

      <ScrollIndicator
        scrollIndex={scrollIndex}
        scrollPrev={emblaApi?.scrollPrev}
        scrollNext={emblaApi?.scrollNext}
      />
    </div>
  );
};
/** -----------MarketsHeader end ------------ */

type BlockListProps = {
  className?: string;
  total24Amount?: number;
  totalOpenInterest?: number;
  assets?: number;
};

/** -----------MarketsHeader start ------------ */
const BlockList: React.FC<BlockListProps> = (props) => {
  const { total24Amount, totalOpenInterest, assets } = props;

  const list = useMemo(() => {
    return [
      {
        label: "24h volume",
        value: total24Amount,
      },
      {
        label: "Open interest",
        value: totalOpenInterest,
      },
      {
        label: "Assets (TVL)",
        value: assets,
      },
    ];
  }, [total24Amount, totalOpenInterest, assets]);
  return (
    <Flex
      direction="column"
      justify="between"
      width="100%"
      height="236px"
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
  label: string;
  value?: number;
};

const BlockItem: React.FC<BlockItemProps> = (props) => {
  return (
    <Box intensity={900} r="lg" px={4} py={3} width="100%">
      <Text as="div" intensity={36} size="xs" weight="semibold">
        {props.label}
      </Text>

      <Text.numeral size="base" currency="$" className="">
        {props.value!}
      </Text.numeral>
    </Box>
  );
};

type CardItemProps = {
  data?: TListItem[];
  title: ReactNode;
  className?: string;
};

const CardItem: React.FC<CardItemProps> = (props) => {
  return (
    <Box
      intensity={900}
      r="lg"
      p={4}
      pb={2}
      // width="100%"
      className={props.className}
    >
      <Text.gradient color="brand" size="sm" weight="semibold">
        {props.title}
      </Text.gradient>

      <Flex direction="column" itemAlign="start" mt={2}>
        {props.data?.map((item, index) => (
          <ListItem key={index} item={item} />
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
};

const ListItem: React.FC<ListItemProps> = (props) => {
  const { item } = props;
  return (
    <Flex width="100%" gapX={3} py={2} className={props.className}>
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
    <Flex gapX={1} mt={1} mb={3} justify="center" className="3xl:hidden">
      {[0, 1].map((item) => {
        return (
          <Box
            key={item}
            py={1}
            pl={item === 0 ? 1 : 0}
            pr={item === 1 ? 1 : 0}
            onClick={() => {
              scrollIndex === 0 ? scrollNext?.() : scrollPrev?.();
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

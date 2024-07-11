import { FC, ReactNode, useMemo } from "react";
import { HeaderReturns } from "./header.script";
import { Box, cn, Flex, Text, TokenIcon } from "@orderly.network/ui";

const data: any = {
  symbol: "PERP_ETH_USDC",
  price: 2115,
  change: 0.04,
  precision: 2,
  "24h_volume": 413241234,
  openInterest: 123432443,
  assets: 123432443,
};

const list = [data, data, data, data, data];

export const MarketsHeader: FC<HeaderReturns> = (props) => {
  const { emblaRef, emblaApi, scrollIndex } = props;
  const cls =
    "oui-flex-[0_0_calc((100%_-_32px)_/_3)] oui-min-w-0 oui-select-none oui-cursor-pointer";

  return (
    <div className="" id="oui-markets-header">
      <Text size="2xl" weight="semibold">
        Markets
      </Text>

      <div className="oui-overflow-hidden" ref={emblaRef}>
        <Flex width="100%" gapX={4} mt={4}>
          <BlockList data={data} className={cls} />
          <CardItem
            data={list}
            title={<Text.gradient color="brand">New listings</Text.gradient>}
            className={cls}
          />
          <CardItem
            data={list}
            title={<Text className="oui-text-success-light">Top gainers</Text>}
            className={cls}
          />
          <CardItem
            data={list}
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
    </div>
  );
};

type TBlockData = {
  "24h_volume": number;
  openInterest: number;
  assets: number;
};

export type BlockListProps = {
  data: TBlockData;
  className?: string;
};

export const BlockList: React.FC<BlockListProps> = (props) => {
  const { data } = props;

  const list = useMemo(() => {
    return [
      {
        label: "24h volume",
        value: data["24h_volume"],
      },
      {
        label: "Open interest",
        value: data.openInterest,
      },
      {
        label: "Assets (TVL)",
        value: data.assets,
      },
    ];
  }, [data]);
  return (
    <Flex
      direction="column"
      justify="between"
      width="100%"
      height="236px"
      className={props.className}
    >
      {list?.map((item) => (
        <BlockItem key={item.label} {...item} />
      ))}
    </Flex>
  );
};

export type BlockItemProps = {
  label: string;
  value: number;
};

export const BlockItem: React.FC<BlockItemProps> = (props) => {
  return (
    <Box intensity={900} r="lg" px={4} py={3} width="100%">
      <Text as="div" intensity={36} size="xs" weight="semibold">
        {props.label}
      </Text>

      <Text.numeral size="base" cureency="$" className="">
        {props.value}
      </Text.numeral>
    </Box>
  );
};

export type CardItemProps = {
  data?: TListItem[];
  title: ReactNode;
  className?: string;
};

export const CardItem: React.FC<CardItemProps> = (props) => {
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
        {props.data?.map((item) => (
          <ListItem key={item.symbol} item={item} />
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

export type ListItemProps = {
  item: TListItem;
  className?: string;
};

export const ListItem: React.FC<ListItemProps> = (props) => {
  const { item } = props;
  return (
    <Flex width="100%" gapX={3} py={2} className={props.className}>
      <Flex width="100%" gapX={1}>
        <TokenIcon symbol={item.symbol} size="xs" />
        <Text.formatted
          rule="symbol"
          formatString="base"
          size="xs"
          weight="semibold"
        >
          {item.symbol}
        </Text.formatted>
      </Flex>

      <Flex width="100%" justify="end">
        <Text.numeral
          cureency="$"
          size="xs"
          weight="semibold"
          dp={item.precision}
        >
          {item.price}
        </Text.numeral>
      </Flex>

      <Flex width="100%" justify="end">
        <Text.numeral
          rule="percentages"
          coloring
          cureency={item.change > 0 ? "+" : "-"}
          size="xs"
          weight="semibold"
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

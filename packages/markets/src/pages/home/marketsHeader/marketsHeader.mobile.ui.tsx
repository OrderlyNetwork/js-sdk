import { FC, ReactNode, useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useMarketsContext } from "../../../components/marketsProvider";
import { SymbolDisplay } from "../../../components/symbolDisplay";
import { OrderlyIcon } from "../../../icons";
import { MarketsHeaderReturns } from "./marketsHeader.script";

type MobileMarketsHeaderProps = MarketsHeaderReturns & {
  className?: string;
};

export const MobileMarketsHeader: FC<MobileMarketsHeaderProps> = (props) => {
  const {
    news,
    gainers,
    losers,
    total24Amount,
    totalOpenInterest,
    tvl,
    favorite,
  } = props;
  const [activeTab, setActiveTab] = useState("newListings");
  const { onSymbolChange } = useMarketsContext();
  const { t } = useTranslation();

  const onSymbol = (item: any) => {
    onSymbolChange?.(item);
    favorite.addToHistory(item);
  };

  return (
    <div
      id="oui-markets-header"
      className={cn("oui-overflow-hidden", props.className)}
    >
      <BlockList
        total24Amount={total24Amount}
        totalOpenInterest={totalOpenInterest}
        tvl={tvl}
      />

      <Box intensity={900} r="xl" p={3} mt={3}>
        <Tabs size="md" value={activeTab} onValueChange={setActiveTab}>
          <TabPanel
            title={t("markets.newListings")}
            value="newListings"
            testid="oui-testid-markets-tab"
          >
            <CardItem data={news} onSymbol={onSymbol} />
          </TabPanel>
          <TabPanel
            title={t("markets.topGainers")}
            value="topGainers"
            testid="oui-testid-funding-tab"
          >
            <CardItem data={gainers} onSymbol={onSymbol} />
          </TabPanel>
          <TabPanel
            title={t("markets.topLosers")}
            value="topLosers"
            testid="oui-testid-funding-tab"
          >
            <CardItem data={losers} onSymbol={onSymbol} />
          </TabPanel>
        </Tabs>
      </Box>
    </div>
  );
};

type BlockListProps = {
  className?: string;
  total24Amount?: number;
  totalOpenInterest?: number;
  tvl?: number;
};

const BlockList: React.FC<BlockListProps> = (props) => {
  const { total24Amount, totalOpenInterest, tvl } = props;
  const { t } = useTranslation();

  const list = useMemo(() => {
    return [
      {
        label: (
          <Flex gapX={1}>
            <OrderlyIcon /> {t("markets.column.24hVolume")}
          </Flex>
        ),
        value: total24Amount,
      },
      {
        label: (
          <Flex gapX={1}>
            <OrderlyIcon /> {t("markets.openInterest")}
          </Flex>
        ),
        value: totalOpenInterest,
      },
      {
        label: (
          <Flex gapX={1}>
            <OrderlyIcon /> {`${t("common.assets")} (TVL)`}
          </Flex>
        ),
        value: tvl,
      },
    ];
  }, [total24Amount, totalOpenInterest, tvl]);

  return (
    <Flex
      intensity={900}
      r="xl"
      width="100%"
      py={3}
      className={props.className}
    >
      {list?.map((item, index) => (
        <BlockItem
          key={`item-${index}`}
          {...item}
          className={cn(
            index !== list.length - 1 && "oui-border-r oui-border-line-6",
          )}
        />
      ))}
    </Flex>
  );
};

type BlockItemProps = {
  label: ReactNode;
  value?: number;
  rule?: string;
  dp?: number;
  className?: string;
};

const BlockItem: React.FC<BlockItemProps> = (props) => {
  return (
    <Box px={3} width="100%" className={props.className}>
      <Text as="div" intensity={36} size="2xs" weight="semibold">
        {props.label}
      </Text>

      <Text.numeral
        size="base"
        currency="$"
        dp={props.dp || 2}
        rm={Decimal.ROUND_DOWN}
        rule={(props.rule as any) || "human"}
      >
        {props.value!}
      </Text.numeral>
    </Box>
  );
};

type CardItemProps = {
  data?: TListItem[];
  className?: string;
  onSymbol: (item: any) => void;
};

const CardItem: React.FC<CardItemProps> = (props) => {
  return (
    <Flex direction="column" itemAlign="start" mt={3}>
      {props.data?.map((item) => (
        <ListItem
          key={item.symbol}
          item={item}
          onSymbol={props.onSymbol}
          className="oui-px-0"
        />
      ))}
    </Flex>
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
      className={cn("oui-cursor-pointer hover:oui-bg-base-8", props.className)}
      onClick={() => {
        props.onSymbol(item);
      }}
    >
      <SymbolDisplay formatString="base" showIcon className="oui-w-full">
        {item.symbol}
      </SymbolDisplay>

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

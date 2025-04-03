import { FC } from "react";
import { Box, cn, Flex, Grid, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { OrderBookAndTradesState } from "./orderBookAndTrades.script";
import { OrderBookWidget } from "../../base/orderBook";
import { LastTradesWidget } from "../../base/lastTrades";
import { useTranslation } from "@orderly.network/i18n";

export const OrderBookAndTrades: FC<OrderBookAndTradesState> = (props) => {
  return (
    <div ref={props.containerRef} className="oui-h-full">
      {(props.containerSize?.width || 0) >= 572 ? (
        <TwoColLayout {...props} />
      ) : (
        <TabLayout {...props} />
      )}
    </div>
  );
};

const TwoColLayout: FC<OrderBookAndTradesState> = (props) => {
  const { t } = useTranslation();

  return (
    <Grid
      cols={2}
      width={"100%"}
      gap={3}
      className="oui-auto-rows-fr"
      style={{
        height: props.containerSize?.height,
      }}
    >
      <Flex
        direction={"column"}
        itemAlign={"start"}
        // pl={3}
        pt={3}
        pb={3}
        r="2xl"
        className="oui-bg-base-9"
      >
        <Title
          title={t("trading.orderBook")}
          className="oui-pl-3 oui-text-sm"
        />
        <OrderBookWidget
          symbol={props.symbol}
          height={
            props.containerSize
              ? props.containerSize.height - 29 - 24
              : undefined
          }
        />
      </Flex>
      <Flex
        direction={"column"}
        itemAlign={"start"}
        py={3}
        r="2xl"
        className="oui-bg-base-9 oui-h-full"
      >
        <Title
          title={t("trading.lastTrades")}
          className="oui-text-sm oui-px-3"
        />
        <LastTradesWidget
          symbol={props.symbol}
          style={{
            height: props.containerSize && props.containerSize.height - 29 - 24,
          }}
          classNames={{
            listHeader: "oui-px-3",
            list: "oui-px-3",
          }}
        />
      </Flex>
    </Grid>
  );
};
const TabLayout: FC<OrderBookAndTradesState & {}> = (props) => {
  const { t } = useTranslation();

  return (
    <Box
      // pl={3}
      pt={3}
      pb={3}
      pr={0}
      r="2xl"
      className="oui-bg-base-9"
      style={{
        maxHeight: props.containerSize?.height,
      }}
    >
      <Tabs
        value={props.tab}
        variant="contained"
        onValueChange={(tab) => {
          props.setTab(tab as any);
        }}
        classNames={{
          tabsList: "oui-pl-3",
          // tabsContent: props.tab === "lastTrades" ? 'oui-pl-3' : ''
        }}
        size="lg"
      >
        <TabPanel value="orderBook" title={t("trading.orderBook")}>
          <OrderBookWidget
            symbol={props.symbol}
            height={
              props.containerSize
                ? props.containerSize.height - 29 - 18
                : undefined
            }
          />
        </TabPanel>
        <TabPanel value="lastTrades" title={t("trading.lastTrades")}>
          <LastTradesWidget
            symbol={props.symbol}
            style={{
              height:
                props.containerSize && props.containerSize.height - 29 - 18,
            }}
            classNames={{
              root: "oui-pt-[6px]",
              listHeader: "oui-px-3",
              list: "oui-px-3",
            }}
          />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

const Title = (props: { title: string; className?: string }) => {
  return (
    <Text
      size="base"
      intensity={80}
      className={cn("oui-pb-[5px]", props.className)}
    >
      {props.title}
    </Text>
  );
};

import { FC, useEffect, useRef } from "react";
import { Box, Flex, Grid, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { OrderBookAndTradesState } from "./orderBookAndTrades.script";
import { OrderBookWidget } from "../orderBook";
import { LastTradesWidget } from "../lastTrades";

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
        pl={3}
        pt={3}
        pb={3}
        r="2xl"
        className="oui-bg-base-9"
      >
        <Title title="Order book" />
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
        p={3}
        r="2xl"
        className="oui-bg-base-9 oui-h-full"
      >
        <Title title="Last trades" />
        <LastTradesWidget
          symbol={props.symbol}
          style={{
            height: props.containerSize && props.containerSize.height - 29 - 24,
          }}
        />
      </Flex>
    </Grid>
  );
};
const TabLayout: FC<OrderBookAndTradesState> = (props) => {
  return (
    <Box
      pl={3}
      pt={3}
      pb={3}
      pr={props.tab === "lastTrades" ? 3 : 0}
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
      >
        <TabPanel value="orderBook" title={"Order book"}>
          <OrderBookWidget
            symbol={props.symbol}
            height={props.containerSize?.height}
          />
        </TabPanel>
        <TabPanel value="lastTrades" title={"Last trades"}>
          <LastTradesWidget
            symbol={props.symbol}
            style={{
              maxHeight:
                props.containerSize && props.containerSize?.height - 40,
            }}
          />
        </TabPanel>
      </Tabs>
    </Box>
  );
};

const Title = (props: { title: string; className?: string }) => {
  return (
    <Text size="base" intensity={80} className="oui-pb-[5px]">
      {props.title}
    </Text>
  );
};

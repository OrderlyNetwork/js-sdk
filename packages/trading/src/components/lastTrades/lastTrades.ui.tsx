import { FC, ReactNode } from "react";
import { Box, cn, Flex, ScrollArea, Text } from "@orderly.network/ui";
import { LastTradesState } from "./lastTrades.script";
import { API, OrderSide } from "@orderly.network/types";
import { commifyOptional } from "@orderly.network/utils";

export const LastTrades: FC<
  LastTradesState & {
    className?: string;
    style?: React.CSSProperties;
  }
> = (props) => {
  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      className={cn("oui-font-semibold", props.className)}
      width={"100%"}
      height={"100%"}
      style={props.style}
    >
      <Header base={props.base} quote={props.quote} />
      <List
        data={props.data}
        isLoading={props.isLoading}
        baseDp={props.baseDp}
        quoteDp={props.quoteDp}
      />
    </Flex>
  );
};

const Row = (props: {
  key?: React.Key | null;
  classNames?: {
    root?: string;
    left?: string;
    mid?: string;
    right?: string;
  };
  left: ReactNode | string;
  mid: ReactNode | string;
  right: ReactNode | string;
}) => {
  const { key, left, mid, right, classNames } = props;
  return (
    <Flex
      key={key}
      height={20}
      gap={2}
      width={"100%"}
      className={cn("oui-text-xs oui-tabular-nums", classNames?.root)}
    >
      <Box className={cn("oui-flex-1", classNames?.left)}>{left}</Box>
      <Box className={cn("oui-flex-1", classNames?.mid)}>{mid}</Box>
      <Box className={cn("oui-flex-1 oui-text-right", classNames?.right)}>
        {right}
      </Box>
    </Flex>
  );
};

const Header = (props: { base: string; quote: string }) => {
  return (
    <Row
      left="Time"
      mid={`Price(${props.quote})`}
      right={`Qty(${props.base})`}
      classNames={{ root: "oui-text-base-contrast-54 oui-h-[32px]" }}
    />
  );
};

const List = (props: {
  data?: any[];
  isLoading?: boolean;
  baseDp: number;
  quoteDp: number;
}) => {
  return (
    <ScrollArea className="oui-w-full oui-h-full">
      {props.data?.map((item, index) => {
        return (
          <Row
            key={index}
            left={
              <Text.formatted rule={"date"} formatString="HH:mm:ss">
                {item?.ts}
              </Text.formatted>
            }
            mid={commifyOptional(item?.price, { fix: props.quoteDp })}
            right={commifyOptional(item?.size, { fix: props.baseDp })}
            classNames={{
              left: "oui-text-base-contrast-80",
              right:
                item.side === OrderSide.BUY
                  ? "oui-text-trade-profit"
                  : "oui-text-trade-loss",
              mid:
                item.side === OrderSide.BUY
                  ? "oui-text-trade-profit"
                  : "oui-text-trade-loss",
            }}
          />
        );
      })}
    </ScrollArea>
  );
};

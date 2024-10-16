import React, { FC } from "react";
import { Divider, Flex, Grid, Text } from "@orderly.network/ui";
import { OrderCellState } from "./orderCell.script";
import {
  OrderTime,
  Symbol,
  OrderType,
  Qty,
  Filled,
  EstTotal,
  TriggerPrice,
  LimitPrice,
  MarkPrice,
  TPTrigger,
  TPPrice,
  TPSLQuantity,
  SLTrigger,
  SLPrice,
} from "./items";
import { EditBtnWidget } from "./editBtn";
import { CancelBtnWidget } from "./cancelBtn";
import { BracketOrderPriceWidget } from "./bracketOrderPrice";
import { TabType } from "../../orders.widget";

export const OrderCell: FC<
  OrderCellState & {
    className?: string;
  }
> = (props) => {
  console.log("cell", props);
  
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      gap={2}
      itemAlign={"start"}
      className={props.className}
    >
      <Header {...props} />
      <Divider className="oui-w-full" />
      <Body {...props} />
      {props.type === TabType.pending && <BracketOrderPriceWidget {...props} />}
      <Btns {...props} />
    </Flex>
  );
};

export const Header: FC<OrderCellState> = (props) => {
  return (
    <Flex direction={"column"} gap={1} width={"100%"}>
      <Flex justify={"between"} width={"100%"}>
        <Symbol {...props} />
        <OrderTime {...props} />
      </Flex>
      <Flex width={"100%"}>
        <OrderType {...props} />
      </Flex>
    </Flex>
  );
};

export const Body: FC<OrderCellState> = (props) => {
  return (
    <Grid cols={3} rows={2} width={"100%"} gap={1}>
      {itemsWithType(props)}
    </Grid>
  );
};

export const Btns: FC<OrderCellState> = (props) => {
  return (
    <Grid cols={3} rows={1} width={"100%"} gap={2}>
      <div></div>
      <EditBtnWidget state={props} />
      <CancelBtnWidget state={props} />
    </Grid>
  );
};

function itemsWithType(props: OrderCellState) {
  switch (props.type) {
    case TabType.all:
      return <></>;
    case TabType.pending:
      return (
        <>
          <Qty {...props} />
          <Filled {...props} />
          <EstTotal {...props} />
          <TriggerPrice {...props} />
          <LimitPrice {...props} />
          <MarkPrice {...props} />
        </>
      );

    case TabType.tp_sl:
      return (
        <>
          <TPTrigger {...props} />
          <TPPrice {...props} />
          <TPSLQuantity {...props} />
          <SLTrigger {...props} />
          <SLPrice {...props} />
        </>
      );
    case TabType.filled:
      return <></>;
    case TabType.cancelled:
      return <></>;
    case TabType.rejected:
      return <></>;
    case TabType.orderHistory:
      return (
        <>
          <Qty {...props} />
          <Filled {...props} />
          <TriggerPrice {...props} />
        </>
      );
  }
}

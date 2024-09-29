import { FC } from "react";
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
} from "./items";
import { EditBtnWidget } from "./editBtn";
import { CancelBtnWidget } from "./cancelBtn";

export const OrderCell: FC<
  OrderCellState & {
    className?: string;
  }
> = (props) => {
  return (
    <Flex
      direction={"column"}
      width={"100%"}
      gap={2}
      className={props.className}
    >
      <Header {...props} />
      <Divider className="oui-w-full" />
      <Body {...props} />
      <TPSL {...props} />
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
      <Qty {...props} />
      <Filled {...props} />
      <EstTotal {...props} />
      <TriggerPrice {...props} />
      <LimitPrice {...props} />
      <MarkPrice {...props} />
    </Grid>
  );
};
export const TPSL: FC<OrderCellState> = (props) => {
  return <>TP/SL</>;
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

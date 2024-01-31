import { FC, useContext, useMemo, useRef } from "react";
import { Table } from "@/table";
import { Numeral, Text } from "@/text";
import {
  OrderStatus,
  OrderSide,
  API,
  OrderEntity,
} from "@orderly.network/types";
import Button from "@/button";
import { cx } from "class-variance-authority";
import { upperCaseFirstLetter } from "@/utils/string";
import { OrderlyAppContext, SymbolContext, SymbolProvider } from "@/provider";
import { EndReachedBox } from "@/listView/endReachedBox";
import { Renew } from "./renew";
import { CancelButton } from "@/block/orders/full/cancelButton";
import { cn } from "@/utils";
import { columnsBasis } from "@/block/orders/columnsUtil";
import { OrderTrades } from "../orderTrades";

interface Props {
  dataSource: API.OrderExt[];
  loading?: boolean;
  loadMore?: () => void;
  className?: string;
  //   status: OrderStatus;
  //   onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
}
export const Listview: FC<Props> = (props) => {
  const columns = useMemo(() => {
    return columnsBasis();
  }, []);
  return (
    <EndReachedBox
      onEndReached={() => {
        if (!props.loading) {
          props.loadMore?.();
        }
      }}
    >
      <Table
        bordered
        justified
        columns={columns}
        loading={props.loading}
        dataSource={props.dataSource}
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={cn(
          "orderly-text-2xs orderly-text-base-contrast-80",
          props.className
        )}
        generatedRowKey={(record, index) => `${index}${record.order_id || record.algo_order_id}`}
        onRow={(record) => {
          // console.log(record);
          if (record.status === OrderStatus.CANCELLED) {
            return {
              className: "orderly-text-base-contrast-20",
              "data-cancelled": "true",
            };
          }
          return {};
        }}
        renderRowContainer={(record, index, children) => {
          return (
            <SymbolProvider
              key={index}
              symbol={record.symbol}
              children={children}
            />
          );
        }}
        expandRowRender={(record, index) => {
          return <OrderTrades record={record} index={index} />;
        }}
      />
    </EndReachedBox>
  );
};

import { useState } from "react";
import { API, PositionType } from "@orderly.network/types";
import {
  Box,
  ChevronDownIcon,
  cn,
  ExclamationFillIcon,
  Flex,
  Text,
  toast,
  Tooltip,
  ThrottledButton,
  useScreen,
} from "@orderly.network/ui";
import { OrderInfo } from "../components/orderInfo";
import { OrdersTable } from "./ordersTable";
import { OrdersTableMobile } from "./ordersTable.mobile";
import { TPSLDetailState } from "./tpslDetail.script";

export const TPSLDetailUI = (props: TPSLDetailState) => {
  const {
    position,
    fullPositionOrders,
    partialPositionOrders,
    onCancelOrder,
    onCancelAllTPSLOrders,
    editTPSLOrder,
    addTPSLOrder,
  } = props;

  return (
    <Box>
      <OrderInfo
        order={{
          symbol: position.symbol,
          order_quantity: position.position_qty.toString(),
          order_price: position.average_open_price.toString(),
        }}
        classNames={{
          root: cn("oui-mb-6 oui-gap-3 oui-px-5"),
          container: "oui-gap-x-[30px]",
        }}
      />
      <FullPositionPart
        position={position}
        orders={fullPositionOrders}
        onCancelOrder={onCancelOrder}
        onCancelAllTPSLOrders={onCancelAllTPSLOrders}
        editTPSLOrder={editTPSLOrder}
        addTPSLOrder={addTPSLOrder}
      />
      <PartialPositionPart
        position={position}
        orders={partialPositionOrders}
        onCancelOrder={onCancelOrder}
        onCancelAllTPSLOrders={onCancelAllTPSLOrders}
        editTPSLOrder={editTPSLOrder}
        addTPSLOrder={addTPSLOrder}
      />
    </Box>
  );
};

const FullPositionPart = (props: {
  orders: API.AlgoOrder[];
  onCancelOrder: (order: API.AlgoOrder) => Promise<void>;
  onCancelAllTPSLOrders: () => Promise<void>;
  position: API.Position;
  editTPSLOrder: (order: API.AlgoOrder, positionType: PositionType) => void;
  addTPSLOrder: (positionType: PositionType) => void;
}) => {
  const [open, setOpen] = useState(true);
  const { orders } = props;
  const { isMobile } = useScreen();
  return (
    <Box className="oui-mt-6">
      <Box
        className={cn("oui-flex oui-items-center oui-justify-between oui-px-5")}
      >
        <PositionTypeDescription
          positionType={PositionType.FULL}
          open={open}
          onOpenChange={setOpen}
        />
        {orders && orders.length === 0 && (
          <Flex gap={2}>
            <AddButton
              positionType={PositionType.FULL}
              position={props.position}
              addTPSLOrder={props.addTPSLOrder}
            />
          </Flex>
        )}
      </Box>

      <Box
        className={cn(
          "oui-overflow-hidden oui-transition-[height] oui-duration-150",
          open ? "oui-h-auto" : "oui-h-0 oui-pb-4",
        )}
      >
        {isMobile ? (
          <OrdersTableMobile
            orders={orders}
            editTPSLOrder={(order) =>
              props.editTPSLOrder(order, PositionType.FULL)
            }
            canCancelOrder={props.onCancelOrder}
          />
        ) : (
          <OrdersTable
            orders={orders}
            editTPSLOrder={(order) => {
              props.editTPSLOrder(order, PositionType.FULL);
            }}
            onCancelOrder={props.onCancelOrder}
          />
        )}
      </Box>
    </Box>
  );
};

const PartialPositionPart = (props: {
  position: API.Position;
  orders: API.AlgoOrder[];
  onCancelOrder: (order: API.AlgoOrder) => Promise<void>;
  onCancelAllTPSLOrders: () => Promise<void>;
  editTPSLOrder: (order: API.AlgoOrder, positionType: PositionType) => void;
  addTPSLOrder: (positionType: PositionType) => void;
}) => {
  const [open, setOpen] = useState(true);
  const { orders } = props;
  const { isMobile } = useScreen();
  return (
    <Box className="oui-pt-6">
      <Box
        className={cn(
          "oui-flex oui-items-center oui-justify-between",
          "oui-px-5",
          isMobile
            ? "oui-flex-col oui-items-start oui-justify-start oui-gap-[11px]"
            : "oui-flex-row oui-items-center oui-justify-between",
        )}
      >
        <PositionTypeDescription
          positionType={PositionType.PARTIAL}
          open={open}
          onOpenChange={setOpen}
        />
        <Flex gap={2}>
          <AddButton
            positionType={PositionType.PARTIAL}
            position={props.position}
            addTPSLOrder={props.addTPSLOrder}
          />
          {orders && orders.length > 0 && (
            <CancelAllBtn
              canCancelAll={orders && orders.length > 0}
              onCancelAllTPSLOrders={props.onCancelAllTPSLOrders}
            />
          )}
        </Flex>
      </Box>
      <Box
        className={cn(
          "oui-overflow-hidden oui-transition-[height] oui-duration-150",
          open ? "oui-h-auto" : "oui-h-0 oui-pb-4",
        )}
      >
        {isMobile ? (
          <OrdersTableMobile
            orders={orders}
            editTPSLOrder={(order) =>
              props.editTPSLOrder(order, PositionType.PARTIAL)
            }
            canCancelOrder={props.onCancelOrder}
          />
        ) : (
          <OrdersTable
            orders={orders}
            editTPSLOrder={(order) => {
              props.editTPSLOrder(order, PositionType.PARTIAL);
            }}
            onCancelOrder={props.onCancelOrder}
          />
        )}
      </Box>
    </Box>
  );
};

const PositionTypeDescription = (props: {
  positionType: PositionType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Flex
      gap={1}
      itemAlign={"center"}
      justify={"start"}
      className="oui-text-2xs"
    >
      <Flex
        itemAlign={"center"}
        justify={"start"}
        gap={1}
        className="oui-cursor-pointer"
        onClick={() => props.onOpenChange(!props.open)}
      >
        <ChevronDownIcon
          size={12}
          color="white"
          className={cn(
            "oui-cursor-pointer oui-transition-transform",
            props.open && "oui-rotate-180",
          )}
        />
        {props.positionType === PositionType.FULL ? (
          <Text>TP/SL: Full position</Text>
        ) : (
          <Text>TP/SL: Partial position </Text>
        )}
      </Flex>
      <Tooltip
        className="oui-w-[280px] oui-p-3"
        content={
          props.positionType === PositionType.FULL
            ? "TPSL (full) applies to the full position. Newly activated TPSL (full) orders will overwrite previous orders. Full position will be market closed when the price is triggered."
            : "TP/SL triggers at the specified mark price and executes as a market order. By default, it applies to the entire position. Adjust settings in open positions for partial TP/SL."
        }
      >
        <ExclamationFillIcon
          className="oui-cursor-pointer oui-text-base-contrast-54"
          size={12}
        />
      </Tooltip>
    </Flex>
  );
};

export const AddButton = (props: {
  positionType: PositionType;
  position: API.Position;
  addTPSLOrder: (positionType: PositionType) => void;
}) => {
  const onAdd = () => {
    props.addTPSLOrder(props.positionType);
  };
  return (
    <ThrottledButton
      variant="outlined"
      size="sm"
      color="gray"
      className="oui-h-6 oui-w-[94px] oui-text-2xs"
      onClick={onAdd}
    >
      Add
    </ThrottledButton>
  );
};

export const CancelAllBtn = (props: {
  onCancelAllTPSLOrders: () => Promise<void>;
  canCancelAll: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <ThrottledButton
      loading={loading}
      variant="outlined"
      disabled={!props.canCancelAll}
      size="sm"
      color="gray"
      className="oui-h-6  oui-w-[94px] oui-text-2xs disabled:oui-border-base-contrast-16 disabled:oui-bg-transparent disabled:oui-text-base-contrast-20"
      onClick={() => {
        setLoading(true);
        props
          .onCancelAllTPSLOrders()
          .then(
            () => {},
            (error) => {
              toast.error(error.message);
            },
          )
          .finally(() => {
            setLoading(false);
          });
      }}
    >
      Cancel all
    </ThrottledButton>
  );
};

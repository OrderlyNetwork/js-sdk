import { OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "./orderList.script";
import { OrderList } from "./orderList.ui";

export const OrderListWidget = (props: {
    ordersStatus: OrderStatus;
    filterSides?: boolean;
    filterStatus?: boolean;
    filterDate?: boolean
}) => {
    const state = useOrderListScript(props);
    return (
        <OrderList {...state}/>
    );
};

import { OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "./orderList.script";
import { OrderList } from "./orderList.ui";
import { TabType } from "../orders.widget";

export const OrderListWidget = (props: {
    type: TabType;
    ordersStatus?: OrderStatus;
    filterSides?: boolean;
    filterStatus?: boolean;
    filterDate?: boolean
}) => {
    const state = useOrderListScript(props);
    return (
        <OrderList {...state}/>
    );
};

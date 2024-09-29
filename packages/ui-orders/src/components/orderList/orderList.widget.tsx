import { OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "./orderList.script";
import { DesktopOrderList, MobileOrderList } from "./orderList.ui";
import { TabType } from "../orders.widget";

export const DesktopOrderListWidget = (props: {
    type: TabType;
    ordersStatus?: OrderStatus;
}) => {
    const state = useOrderListScript(props);
    return (
        <DesktopOrderList {...state}/>
    );
};


export const MobileOrderListWidget = (props: {
    type: TabType;
    ordersStatus?: OrderStatus;
}) => {
    const state = useOrderListScript(props);
    return (
        <MobileOrderList {...state}/>
    );
};

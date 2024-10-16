import { OrderStatus } from "@orderly.network/types";
import { useOrderListScript } from "./orderList.script";
import { DesktopOrderList, MobileOrderList } from "./orderList.ui";
import { TabType } from "../orders.widget";

export const DesktopOrderListWidget = (props: {
    type: TabType;
    ordersStatus?: OrderStatus;
    /** if has value, will be fetch current symbol orders*/
    symbol?: string;
}) => {
    const state = useOrderListScript(props);
    return (
        <DesktopOrderList {...state}/>
    );
};


export const MobileOrderListWidget = (props: {
    type: TabType;
    ordersStatus?: OrderStatus;
    /** if has value, will be fetch current symbol orders*/
    symbol?: string;
    classNames?: {
        root?: string;
        cell?: string;
    },
    showFilter?: boolean;
}) => {
    const state = useOrderListScript(props);
    return (
        <MobileOrderList {...state} classNames={props.classNames} showFilter={props.showFilter}/>
    );
};

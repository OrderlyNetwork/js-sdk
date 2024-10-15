import { API } from "@orderly.network/types";
import { useOrderCellScript } from "./orderCell.script";
import { OrderCell } from "./orderCell.ui";
import { TabType } from "../../orders.widget";

export const OrderCellWidget = (props: {
    item: API.AlgoOrderExt;
    index: number;
    className?: string;
    type: TabType;
}) => {
    const { className, ...rest} = props;
    
    const state = useOrderCellScript(rest);
    return (<OrderCell {...state} className={className}/>);
};

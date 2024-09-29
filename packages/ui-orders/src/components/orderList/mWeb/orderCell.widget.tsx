import { API } from "@orderly.network/types";
import { useOrderCellScript } from "./orderCell.script";
import { OrderCell } from "./orderCell.ui";

export const OrderCellWidget = (props: {
    item: API.OrderExt;
    index: number;
    className?: string;
}) => {
    const state = useOrderCellScript(props);
    return (<OrderCell {...state} className={props.className}/>);
};

import { API } from "@orderly.network/types";
import { useSymbolContext } from "../symbolProvider";
import { TabType } from "../../orders.widget";

export const useOrderCellScript = (props: {
    item: API.AlgoOrderExt;
    index: number;
    type: TabType;
}) => {
    const symbolInfo = useSymbolContext();
    return {
        ...props,
        ...symbolInfo,
    };
};

export type OrderCellState = ReturnType<typeof useOrderCellScript>;

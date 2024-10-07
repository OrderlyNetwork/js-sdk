import { API } from "@orderly.network/types";
import { useSymbolContext } from "../symbolProvider";

export const useOrderCellScript = (props: {
    item: API.OrderExt;
    index: number;
}) => {
    const symbolInfo = useSymbolContext();
    return {
        ...props,
        ...symbolInfo,
    };
};

export type OrderCellState = ReturnType<typeof useOrderCellScript>;

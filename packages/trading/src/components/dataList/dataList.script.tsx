export enum DataListTabType {
    positions = "Positions",
    pending = "Pending",
    tp_sl = "TP/SL",
    filled = "Filled",
    orderHistory = "Order history",
}

export const useDataListScript = (props: {current?: DataListTabType}) => {
    const { current } = props;
    return {
        current
    };
};

export type DataListState = ReturnType<typeof useDataListScript>;

import { PositionsProps } from "@orderly.network/ui-positions";

export enum DataListTabType {
    positions = "Positions",
    pending = "Pending",
    tp_sl = "TP/SL",
    filled = "Filled",
    orderHistory = "Order history",
}

export const useDataListScript = (props: {
    current?: DataListTabType;
    config: PositionsProps;
  }) => {
    const { current, config } = props;
    return {
        current,
        config,
    };
};

export type DataListState = ReturnType<typeof useDataListScript>;

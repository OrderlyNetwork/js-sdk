import { API } from "@orderly.network/types";
import { create } from "zustand";
// import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

type PositionState = {
  // positions: API.PositionTPSLExt[];
  // aggregated: API.PositionAggregated;
  positions: API.PositionsTPSLExt;
};

type PositionActions = {
  // updatePosition: (position: API.PositionTPSLExt[]) => void;
  setPositions: (positions: API.PositionsTPSLExt) => void;
  // setAggregated: (aggregated: API.PositionAggregated) => void;
  // getPositions: () => SWRResponse<API.PositionInfo>;
};

const usePositionStore = create<
  PositionState & {
    actions: PositionActions;
  }
  // [["zustand/devtools", never]]
>()(
  devtools(
    (set) => ({
      positions: {
        rows: [],
        margin_ratio: 0,
        initial_margin_ratio: 0,
        maintenance_margin_ratio: 0,
        open_margin_ratio: 0,
        current_margin_ratio_with_orders: 0,
        initial_margin_ratio_with_orders: 0,
        maintenance_margin_ratio_with_orders: 0,
        total_collateral_value: 0,
        free_collateral: 0,
        total_pnl_24_h: 0,
        total_unreal_pnl: 0,
        total_unsettled_pnl: 0,
        notional: 0,
      },
      actions: {
        setPositions: (positions: API.PositionsTPSLExt) => {
          set(
            {
              positions,
            },
            false,
            "setPositions"
          );
        },
      },
    }),
    {
      enabled: false,
      name: "positions",
    }
  )
);

const usePositions = () => usePositionStore((state) => state.positions.rows);
const usePositionActions = () => usePositionStore((state) => state.actions);

export { usePositionStore, usePositions, usePositionActions };

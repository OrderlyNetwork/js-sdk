import { API } from "@orderly.network/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
// import { devtools } from "zustand/middleware";

export const DEFAULT_POSITIONS = "positions";

export const POSITION_EMPTY = {
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
};

type PositionState = {
  // positions: API.PositionTPSLExt[];
  // aggregated: API.PositionAggregated;
  // positions: API.PositionsTPSLExt;
  // [key: string]: API.PositionsTPSLExt;
  positions: {
    all: API.PositionsTPSLExt;
    [key: string]: API.PositionsTPSLExt;
  };
};

type PositionActions = {
  // updatePosition: (position: API.PositionTPSLExt[]) => void;
  setPositions: (key: string, positions: API.PositionsTPSLExt) => void;
  // setAggregated: (aggregated: API.PositionAggregated) => void;
  // getPositions: () => SWRResponse<API.PositionInfo>;
};

const usePositionStore = create<
  PositionState & {
    actions: PositionActions;
  }
  // [["zustand/devtools", never]]
>()(
  immer((set) => ({
    positions: {
      all: POSITION_EMPTY,
    },
    actions: {
      setPositions: (key: string, positions: API.PositionsTPSLExt) => {
        set((state) => {
          state.positions[key] = positions;
        });
      },
    },
  }))
);

const usePositions = (symbol: string = "all") =>
  usePositionStore((state) => (state.positions[symbol] ?? POSITION_EMPTY).rows);

const usePositionActions = () => usePositionStore((state) => state.actions);

export { usePositionStore, usePositions, usePositionActions };

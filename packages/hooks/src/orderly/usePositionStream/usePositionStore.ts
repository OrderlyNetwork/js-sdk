import { API } from "@orderly.network/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { usePrivateQuery } from "../../usePrivateQuery";
import { SWRResponse } from "swr";

type PositionState = {
  positions: API.PositionTPSLExt[];
};

type PositionActions = {
  updatePosition: (position: API.PositionTPSLExt[]) => void;
  setPositions: (positions: API.PositionTPSLExt[]) => void;
  // getPositions: () => SWRResponse<API.PositionInfo>;
};

const usePositionStore = create<
  PositionState & {
    actions: PositionActions;
  }
>()(
  immer((set) => ({
    positions: [],
    actions: {
      updatePosition: (positions: API.PositionTPSLExt[]) => {
        set((state) => {
          state.positions = positions;
        }, true);
      },
      setPositions: (positions: API.PositionTPSLExt[]) => {
        set((state) => {
          state.positions = positions;
        }, true);
      },

      // getPositions: () => {
      //   // return usePrivateQuery<API.PositionInfo>(`/v1/positions`, {
      //   //   formatter: (data) => data,
      //   //   onError: (err) => {},
      //   //   onSuccess: (data) => {
      //   //     // console.log(data);
      //   //     set((state) => {
      //   //       state.positions = data.rows;
      //   //     }, true);
      //   //   },
      //   // });
      // },
    },
  }))
);

const usePositions = () => usePositionStore((state) => state.positions);
const usePositionActions = () => usePositionStore((state) => state.actions);

export { usePositionStore, usePositions, usePositionActions };

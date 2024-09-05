// import { unstable_batchedUpdates } from 'react-dom'

import { API } from "@orderly.network/types";
import { Calculator } from "../../types";
import {
  positionActions,
  usePositions,
  usePositionStore,
} from "../usePositionStream/usePositionStore";

class PositionCalculator implements Calculator<API.PositionTPSLExt[]> {
  calc(markPrice: Record<string, number>) {
    // console.log("!!!! Calculating positions...", markPrice);
    // const positions = usePositions();

    // console.log("22222 Calculating positions...", positions);
    // const {updatePosition } = positionActions();
    return [];
  }

  update(data: API.PositionTPSLExt[]) {
    // console.log("!!!! Updating positions...", data);
    const { updatePosition } = positionActions();

    updatePosition(data);
  }
}

// const usePositionCalculator = () => new PositionCalculator();

export { PositionCalculator };

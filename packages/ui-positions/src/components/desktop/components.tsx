import { usePositionsRowContext } from "./positionRowContext";

import { PositionTPSLPopover } from "@orderly.network/ui-tpsl";

// ------------ TP/SL Price input end------------
export const TPSLButton = () => {
  const { position, baseDp, quoteDp } = usePositionsRowContext();

  return (
    <PositionTPSLPopover position={position} label="TP/SL" baseDP={baseDp} />
  );
};

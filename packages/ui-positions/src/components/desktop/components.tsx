import { PositionTPSLPopover } from "@orderly.network/ui-tpsl";
import { usePositionsRowContext } from "./positionRowContext";

// ------------ TP/SL Price input end------------
export const TPSLButton = () => {
  const { position, baseDp, quoteDp } = usePositionsRowContext();

  return (
    <PositionTPSLPopover position={position} label="TP/SL" baseDP={baseDp} />
  );
};

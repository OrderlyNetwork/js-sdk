import { API } from "@orderly.network/types";
import { PositionTPSLPopover } from "@orderly.network/ui-tpsl";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";

export const TP_SLEditButton = (props: { order: API.Order }) => {
  const { position, order } = useTPSLOrderRowContext();
  return (
    <PositionTPSLPopover position={position!} order={order} label="Edit" />
  );
};

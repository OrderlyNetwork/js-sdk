import { OrderSide, type API } from "@orderly.network/types";
import { ClosePositionPane } from "./closeForm";
import { useModal } from "@orderly.network/ui";

export interface PositionLimitCloseDialogProps {
  positions: API.Position;
  side: OrderSide;
}

export const PositionLimitCloseDialog = (
  props: PositionLimitCloseDialogProps
) => {
  const { hide, reject, resolve } = useModal();
  return (
    <ClosePositionPane
      position={props.positions}
      onCancel={() => {
        reject();
        hide();
      }}
      onClose={(res) => {
        resolve(res);
        hide();
      }}
      side={props.side}
    />
  );
};

import { Text } from "@/text";
import { API } from "@orderly.network/types";
import { FC } from "react";

interface Props {
  position: API.Position;
}

export const LimitConfirm: FC<Props> = (props) => {
  const { position } = props;
  return (
    <div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col">
          <Text type={"sell"}>Limit Sell</Text>
          <div>ETH-PERP</div>
        </div>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-base-contrast/50">Qty.</span>
            <span>131311</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-contrast/50">Price</span>
            <span>131311</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-contrast/50">Total</span>
            <span>131311</span>
          </div>
        </div>
      </div>
      <div className="pb-3 pt-5 text-sm text-base-contrast/50">
        (Pending ETH orders won’t be affected)
      </div>
    </div>
  );
};

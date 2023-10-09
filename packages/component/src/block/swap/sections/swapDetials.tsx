import Button from "@/button";
import { ListTile } from "@/listView";
import { Fuel } from "lucide-react";
import { FC } from "react";

interface Props {
  onConfirm: () => void;
}

export const SwapDetails: FC<Props> = (props) => {
  return (
    <>
      <div className="text-sm space-y-3 py-[24px]">
        <ListTile
          className="py-0"
          tailing={
            <div className="flex items-center gap-1 text-primary-light">
              <Fuel size={14} />
              <span>0.0832</span>
              <span>BNB</span>
              <span className="text-primary-light/50">($1.54)</span>
            </div>
          }
        >
          <span className="text-base-contrast/50">Destination gas fee</span>
        </ListTile>
        <ListTile
          className="py-0"
          tailing={
            <div className="flex items-center gap-1">
              <span>0.000012 BNB</span>
              <span className="text-base-contrast/50">($11.00)</span>
            </div>
          }
        >
          <span className="text-base-contrast/50">Trading fee</span>
        </ListTile>
        <ListTile className="py-0" tailing="91.23 USDC">
          <span className="text-base-contrast/50">Minimum received</span>
        </ListTile>
        <ListTile className="py-0" tailing="1 ETH = 1623.23 USDC">
          <span className="text-base-contrast/50">Price</span>
        </ListTile>
        <ListTile className="py-0" tailing="1%">
          <span className="text-base-contrast/50">Slippage tolerance</span>
        </ListTile>
      </div>
      <Button fullWidth onClick={() => props.onConfirm()}>
        Confirm to swap
      </Button>
    </>
  );
};

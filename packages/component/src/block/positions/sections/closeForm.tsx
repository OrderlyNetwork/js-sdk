import Button from "@/button";
import {
  DialogContent,
  DialogTrigger,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/dialog";
import { Divider } from "@/divider";
import { Input } from "@/input";
import { Sheet, SheetContent, SheetDescription, SheetTrigger } from "@/sheet";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { Text } from "@/text";
import { type API } from "@orderly.network/core";
import { Info } from "lucide-react";
import { FC, useMemo } from "react";
import { LimitConfirm } from "./limitConfirm";
import { useModal } from "@/modal";

export interface ClosePositionPaneProps {
  position: API.Position;
  onConfirm?: () => void;

  onCancel?: () => void;
}
export const ClosePositionPane: FC<ClosePositionPaneProps> = (props) => {
  const { position } = props;
  const { hide } = useModal();
  const typeText = useMemo(() => {
    if (position.position_qty > 0) return <Text type={"sell"}>Limit Sell</Text>;
    return <Text type={"buy"}>Limit Buy</Text>;
  }, [position.position_qty]);
  return (
    <>
      <div className="pb-3 pt-5">{position.symbol}</div>
      <div className="grid grid-cols-2">
        <Statistic
          label="Order Type"
          value={typeText}
          labelClassName="text-sm text-base-contrast/30"
        />
        <Statistic
          label="Last Price"
          value="1000.00"
          labelClassName="text-sm text-base-contrast/30"
        />
      </div>
      <Divider className="py-5" />
      <div className="flex flex-col gap-5">
        <Input prefix="Price" suffix="USDC" className="text-right" />
        <Input
          prefix="Quantity"
          suffix="BTC"
          className="text-right"
          defaultValue={position.position_qty}
        />
      </div>

      <div className="py-5">
        <Slider
          step={0.01}
          min={0}
          max={position.position_qty}
          color={"buy"}
          marks={[
            {
              value: 0,
              label: "0%",
            },
            {
              value: 25,
              label: "25%",
            },
            {
              value: 50,
              label: "50%",
            },
            {
              value: 75,
              label: "75%",
            },
            {
              value: 100,
              label: "100%",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 py-5">
        <Button
          fullWidth
          color={"secondary"}
          onClick={() => {
            // props.onCancel?.()
            hide();
          }}
        >
          Cancel
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button fullWidth>Confirm</Button>
          </DialogTrigger>
          <DialogContent closable={false}>
            <DialogHeader>
              <DialogTitle className="flex justify-center items-center space-x-2">
                <Info className="text-warning" />
                <span>Limit Close</span>
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="bg-base-100 px-5 py-2">
              You agree to close
              <span className="text-warning text-base inline-block px-2">
                101.04934603 ETH
              </span>
              position at limit price.
            </DialogDescription>
            <DialogBody>
              <LimitConfirm />
            </DialogBody>
            <DialogFooter>
              <Button color={"danger"}>Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

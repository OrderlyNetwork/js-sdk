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
import { modal, useModal } from "@/modal";
import { useSymbolsInfo, useMarkPricesStream } from "@orderly.network/hooks";

export interface ClosePositionPaneProps {
  position?: API.Position;
  onConfirm?: () => void;

  onCancel?: () => void;
}
export const ClosePositionPane: FC<ClosePositionPaneProps> = (props) => {
  const { position } = props;
  const { hide, reject, resolve } = useModal();

  const { data: markPrices } = useMarkPricesStream();

  const symbolInfo = useSymbolsInfo()[position?.symbol];
  const base = useMemo(() => symbolInfo("base"), [symbolInfo]);
  const quote = useMemo(() => symbolInfo("quote"), [symbolInfo]);

  const typeText = useMemo(() => {
    if (position?.position_qty ?? 0 > 0)
      return <Text type={"sell"}>Limit Sell</Text>;
    return <Text type={"buy"}>Limit Buy</Text>;
  }, [position?.position_qty]);

  const onConfirm = () => {
    modal.confirm({
      title: "Limit Close",
      content: <LimitConfirm position={position} />,
    });
  };

  if (!position) return null;

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
          value={markPrices?.[position.symbol]}
          labelClassName="text-sm text-base-contrast/30"
        />
      </div>
      <Divider className="py-5" />
      <div className="flex flex-col gap-5">
        <Input prefix="Price" suffix={quote} className="text-right" />
        <Input
          prefix="Quantity"
          suffix={base}
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
            reject();
            hide();
          }}
        >
          Cancel
        </Button>
        <Button fullWidth onClick={() => onConfirm()}>
          Confirm
        </Button>
      </div>
    </>
  );
};

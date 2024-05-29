import { Input } from "@/input";
import { usePositionsRowContext } from "./positionRowContext";
import { ChangeEvent, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { Slider } from "@/slider";
import { useSymbolContext } from "@/provider/symbolProvider";
import { Decimal } from "@orderly.network/utils";
import { Numeral } from "@/text/numeral";
import { OrderSide } from "@orderly.network/types";

export const QuantityInput = () => {
  const { position, quantity, side, updateQuantity } = usePositionsRowContext();
  const [open, setOpen] = useState(false);
  const { base_tick } = useSymbolContext();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value);
    updateQuantity(e.target.value);
  };

  const percentageClick = (value: number) => {
    const d = new Decimal(position.position_qty);

    updateQuantity(d.mul(value).toString());
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Input value={quantity} size={"small"} onChange={onChange}  className="orderly-font-semibold"/>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="orderly-w-[278px]"
      >
        <div className="orderly-flex">
          <div className="orderly-w-[40px] orderly-text-3xs orderly-pt-[3px]">
            {`${Math.min(
              100,
              Math.ceil(
                (Number(quantity ?? 0) / Math.abs(position.position_qty)) * 100
              )
            )}
            %`}
          </div>
          <div className="orderly-flex-1 orderly-min-w-0">
            <div className="orderly-h-[26px]">
              <Slider
                id="orderly-positions-quantity-full-slider"
                color={side === OrderSide.BUY ? "buy" : "sell"}
                step={base_tick}
                min={0}
                max={Math.abs(position.position_qty)}
                markCount={4}
                value={[Number(quantity ?? 0)]}
                onValueChange={(value) => {
                  if (typeof value[0] !== "undefined") {
                    updateQuantity(value[0].toString());
                  }
                }}
              />
            </div>
            <div className="orderly-flex orderly-justify-between orderly-text-3xs">
              <PercentageButton
                value={0}
                label={"0%"}
                onClick={percentageClick}
              />
              <PercentageButton
                value={0.25}
                label={"25%"}
                onClick={percentageClick}
              />
              <PercentageButton
                value={0.5}
                label={"50%"}
                onClick={percentageClick}
              />
              <PercentageButton
                value={0.75}
                label={"75%"}
                onClick={percentageClick}
              />
              <PercentageButton
                value={1}
                label={"Max"}
                onClick={percentageClick}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const PercentageButton = (props: {
  value: number;
  label: string;
  onClick: (value: number) => void;
}) => {
  return (
    <button
      className="orderly-border orderly-border-base-contrast-54 orderly-rounded orderly-px-1 orderly-text-base-contrast-80 hover:orderly-bg-base-contrast/10"
      onClick={() => {
        props.onClick(props.value);
      }}
    >
      {props.label}
    </button>
  );
};

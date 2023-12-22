import Button from "@/button";
import { FC } from "react";
import { SidePicker } from "@/block/pickers";
import { Label } from "@/label";
import { Checkbox } from "@/checkbox";

interface Props {
  onCancelAll?: () => void;
  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
}

export const Toolbar: FC<Props> = (props) => {
  return (
    <div className="orderly-data-list-filter orderly-flex orderly-justify-between orderly-items-center orderly-py-3 orderly-px-4">
      <div className="orderly-flex orderly-items-center orderly-gap-1">
        <Checkbox
          id={"showAll"}
          checked={props.showAllSymbol}
          onCheckedChange={props.onShowAllSymbolChange}
        />
        <Label htmlFor={"showAll"} className="orderly-text-base-contrast-54">
          Show all instruments
        </Label>
      </div>
      {/* <Button
        variant={"outlined"}
        size={"small"}
        color={"tertiary"}
        onClick={() => {
          props.onCancelAll?.();
        }}
      >
        Cancel all
      </Button> */}
    </div>
  );
};

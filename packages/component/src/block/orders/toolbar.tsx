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
    <div className="flex justify-between items-center py-3 px-4">
      <div className={"flex items-center gap-2"}>
        <Checkbox
          id={"showAll"}
          checked={props.showAllSymbol}
          onCheckedChange={props.onShowAllSymbolChange}
        />
        <Label htmlFor={"showAll"} className={"text-base-contrast/60"}>
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
        Cancel All
      </Button> */}
    </div>
  );
};

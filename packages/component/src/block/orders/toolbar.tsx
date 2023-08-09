import Button from "@/button";
import { FC } from "react";
import { SidePicker } from "@/block/pickers";

interface Props {
  onCancelAll?: () => void;
}

export const Toolbar: FC<Props> = (props) => {
  return (
    <div className="flex justify-between">
      <SidePicker />
      <Button
        variant={"outlined"}
        size={"small"}
        onClick={() => {
          props.onCancelAll?.();
        }}
      >
        Cancel All
      </Button>
    </div>
  );
};

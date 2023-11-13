import { OrderType } from "@orderly.network/types";
import { Circle } from "lucide-react";
import { FC } from "react";

interface Props {
  value: OrderType;
  onValueChange: (value: any) => void;
}

export const OrderTypesCheckbox: FC<Props> = ({ value, onValueChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <OrderTypeItem
        active={value === OrderType.POST_ONLY}
        label="Post only"
        value={OrderType.POST_ONLY}
        onClick={onValueChange}
      />
      <OrderTypeItem
        active={value === OrderType.IOC}
        label="IOC"
        value={OrderType.IOC}
        onClick={onValueChange}
      />
      <OrderTypeItem
        active={value === OrderType.FOK}
        label="FOK"
        value={OrderType.FOK}
        onClick={onValueChange}
      />
    </div>
  );
};

const OrderTypeItem: FC<{
  active: boolean;
  label: string;
  value: OrderType;
  onClick: (value: OrderType | "") => void;
}> = (props) => {
  let clsName = "flex items-center gap-1 cursor-pointer";
  console.log("props.active", props.active);
  if (props.active) {
    clsName += " text-base-contrast";
  } else {
    clsName += " text-base-contrast-54";
  }
  return (
    <div
      className={clsName}
      onClick={() => {
        props.onClick(props.active ? "" : props.value);
      }}
    >
      <button
        type="button"
        className={"w-[14px] h-[14px] rounded-full border-2 border-base-contrast-20"}
      >
        {props.active && (
          <Circle className="w-[10px] h-[10px] text-primary bg-primary rounded-full" />
        )}
      </button>
      <span className="text-3xs">{props.label}</span>
    </div>
  );
};

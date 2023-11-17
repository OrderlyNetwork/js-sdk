import { OrderType } from "@orderly.network/types";
import { Circle } from "lucide-react";
import { FC } from "react";

interface Props {
  value: OrderType;
  onValueChange: (value: any) => void;
}

export const OrderTypesCheckbox: FC<Props> = ({ value, onValueChange }) => {
  return (
    <div className="orderly-flex orderly-items-center orderly-space-x-3">
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
        className="orderly-w-[14px] orderly-h-[14px] orderly-rounded-full orderly-border-2 orderly-border-base-contrast-20"
      >
        {props.active && (
          <Circle className="orderly-w-[10px] orderly-h-[10px] orderly-text-link orderly-bg-link orderly-rounded-full" />
        )}
      </button>
      <span className="orderly-text-3xs">{props.label}</span>
    </div>
  );
};

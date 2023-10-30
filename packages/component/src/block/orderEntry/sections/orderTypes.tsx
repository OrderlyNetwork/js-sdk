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
  return (
    <div
      className="flex items-center gap-1 cursor-pointer"
      onClick={() => {
        props.onClick(props.active ? "" : props.value);
      }}
    >
      <button
        type="button"
        className="w-[14px] h-[14px] rounded-full border-2 border-base-contrast/20 text-base-contrast/80"
      >
        {props.active && (
          <Circle className="fill-current text-current w-[10px] h-[10px]" />
        )}
      </button>
      <span className="text-sm text-base-contrast/50">{props.label}</span>
    </div>
  );
};

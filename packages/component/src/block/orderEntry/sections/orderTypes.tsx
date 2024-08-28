import { OrderType } from "@orderly.network/types";
import { Circle } from "lucide-react";
import { FC } from "react";

interface Props {
  value?: OrderType;
  onValueChange: (value: any) => void;
}

export const OrderTypesCheckbox: FC<Props> = ({ value, onValueChange }) => {
  return (
    <div className="orderly-flex orderly-items-center orderly-space-x-3">
      <OrderTypeItem
        id="orderly-order-entry-expand-content-post-only"
        active={value === OrderType.POST_ONLY}
        label="Post only"
        value={OrderType.POST_ONLY}
        onClick={onValueChange}
      />
      <OrderTypeItem
        id="orderly-order-entry-expand-content-ioc"
        active={value === OrderType.IOC}
        label="IOC"
        value={OrderType.IOC}
        onClick={onValueChange}
      />
      <OrderTypeItem
        id="orderly-order-entry-expand-content-fok"
        active={value === OrderType.FOK}
        label="FOK"
        value={OrderType.FOK}
        onClick={onValueChange}
      />
    </div>
  );
};

const OrderTypeItem: FC<{
  id?: string;
  active: boolean;
  label: string;
  value: OrderType;
  onClick: (value: OrderType | "") => void;
}> = (props) => {
  let clsName =
    "orderly-flex orderly-items-center orderly-gap-1 orderly-cursor-pointer";
  if (props.active) {
    clsName += " orderly-text-base-contrast";
  } else {
    clsName += " orderly-text-base-contrast-54";
  }
  return (
    <div
      id={props.id}
      className={clsName}
      onClick={() => {
        props.onClick(props.active ? "" : props.value);
      }}
    >
      <button
        type="button"
        className="orderly-order-entry-radio-button orderly-w-[14px] orderly-h-[14px] orderly-rounded-full orderly-border-2 orderly-border-base-contrast-20"
      >
        {props.active && (
          // @ts-ignore
          <Circle className="orderly-order-entry-radio-circle orderly-w-[10px] orderly-h-[10px] orderly-text-link orderly-bg-link orderly-rounded-full" />
        )}
      </button>
      <span className="orderly-text-3xs desktop:orderly-text-2xs">
        {props.label}
      </span>
    </div>
  );
};

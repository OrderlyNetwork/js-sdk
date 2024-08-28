import { Checkbox } from "@/checkbox";
import { Collapsible, CollapsibleContent } from "@/collapsible";
import { Label } from "@/label";
import { Switch } from "@/switch";
import { cn } from "@/utils/css";
import { OrderType, MEDIA_TABLET, OrderEntity } from "@orderly.network/types";
import { ChevronDown } from "lucide-react";
import { FC, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { OrderTypesCheckbox } from "./orderTypes";
import { useLocalStorage, useMediaQuery } from "@orderly.network/hooks";
import { MobileHideenLabel, DesktopHiddenLabel } from "./hiddenLabel";
import { MobileReduceOnlyLabel, DesktopReduceOnlyLabel } from "./reduceOnly";

interface OrderOptionsProps {
  reduceOnly?: boolean;
  onReduceOnlyChange?: (value: boolean) => void;
  showConfirm?: boolean;
  onConfirmChange?: (value: boolean) => void;
  formattedOrder: Partial<OrderEntity>;
  onFieldChange: (name: keyof OrderEntity, value: any) => void;
}

export const OrderOptions: FC<OrderOptionsProps> = (props) => {
  const { reduceOnly, formattedOrder, onFieldChange } = props;
  const [optionsOpen, setOptionsOpen] = useLocalStorage(
    "order_entry_options_open",
    false
  );
  const [open, setOpen] = useState<boolean>(optionsOpen);
  // const { control, getValues, setValue } = useFormContext();

  const { order_type } = formattedOrder;

  const isTable = useMediaQuery(MEDIA_TABLET);

  // console.log("------", formattedOrder);

  return (
    <>
      <div className="orderly-flex orderly-items-center orderly-py-[2px] orderly-justify-between orderly-text-base-contrast-54">
        <div className="orderly-flex orderly-gap-2 orderly-items-center">
          <Switch
            id="orderly-reduce-only-switch"
            color={"primary"}
            checked={formattedOrder.reduce_only ?? reduceOnly}
            onCheckedChange={(checked) => {
              // onReduceOnlyChange?.(checked);
              onFieldChange("reduce_only", checked);
              // field.onChange(checked);
            }}
          />
          {isTable ? (
            <MobileReduceOnlyLabel />
          ) : (
            <DesktopReduceOnlyLabel
              reduceOnly={formattedOrder.reduce_only ?? reduceOnly}
              onFieldChange={onFieldChange}
            />
          )}
        </div>

        <button
          id="orderly-order-entry-expand-icon"
          type="button"
          className="orderly-w-[18px] orderly-h-[18px] orderly-px-5 orderly-text-base-contrast/60"
          onClick={() => {
            setOpen((open) => !open);
            setOptionsOpen(!open);
          }}
        >
          {/* @ts-ignore */}
          <ChevronDown
            size={18}
            className={cn(
              "orderly-transition-transform orderly-text-base-contrast/50",
              open && "orderly-rotate-180"
            )}
          />
        </button>
      </div>
      <Collapsible open={open}>
        <CollapsibleContent>
          <div
            id="orderly-order-entry-expand-content"
            className="orderly-pb-2 orderly-space-y-4"
          >
            {order_type === OrderType.LIMIT && (
              <OrderTypesCheckbox
                value={formattedOrder.order_type_ext}
                onValueChange={(value) => {
                  // field.onChange(value);
                  onFieldChange("order_type_ext", value);
                }}
              />
            )}
            <div className="orderly-flex orderly-gap-5">
              <div
                id="orderly-order-entry-expand-content-order-confirm"
                className="orderly-flex orderly-gap-1 first-letter:orderly-items-center"
              >
                <Checkbox
                  id="orderConfirm"
                  checked={props.showConfirm}
                  onCheckedChange={(checked) => {
                    props.onConfirmChange?.(!!checked);
                  }}
                />
                <Label
                  htmlFor="orderConfirm"
                  className="orderly-text-base-contrast-54 desktop:orderly-text-2xs"
                >
                  Order confirm
                </Label>
              </div>
              <div
                id="orderly-order-entry-expand-content-hidden"
                className="orderly-flex orderly-gap-1 orderly-items-center"
              >
                <Checkbox
                  id="hidden"
                  checked={formattedOrder.visible_quantity === 0}
                  onCheckedChange={(checked) => {
                    // props.setValue?.("visible_quantity", checked ? 0 : 1);
                    // field.onChange(checked ? 0 : 1);
                    onFieldChange("visible_quantity", checked ? 0 : 1);
                  }}
                />

                {isTable ? <MobileHideenLabel /> : <DesktopHiddenLabel />}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

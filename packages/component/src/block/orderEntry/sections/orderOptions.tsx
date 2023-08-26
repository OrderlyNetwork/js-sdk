import { Checkbox } from "@/checkbox";
import { Collapsible, CollapsibleContent } from "@/collapsible";
import { Label } from "@/label";
import { Radio, RadioGroup } from "@/radioGroup";
import { Switch } from "@/switch";
import { cn } from "@/utils/css";
import { OrderEntity } from "@orderly/types";
import { ChevronDown } from "lucide-react";
import { FC, useState } from "react";

interface OrderOptionsProps {
  values?: OrderEntity;
  setValue?: (name: keyof OrderEntity, value: any) => void;

  showConfirm?: boolean;
  onConfirmChange?: (value: boolean) => void;
}

export const OrderOptions: FC<OrderOptionsProps> = (props) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <div className="flex items-center py-1 justify-between">
        <div className="flex gap-2 items-center">
          <Switch
            id="reduceOnly"
            color={"profit"}
            checked={props.values?.reduce_only}
            onCheckedChange={(checked) =>
              props.setValue?.("reduce_only", checked)
            }
          />
          <Label htmlFor="reduceOnly">Reduce Only</Label>
        </div>

        <button
          type="button"
          className="w-[18px] h-[18px] px-5 text-base-contrast/60"
          onClick={() => setOpen((open) => !open)}
        >
          <ChevronDown
            size={20}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      <Collapsible open={open}>
        <CollapsibleContent>
          <div className="pb-2 space-y-4">
            <div>
              <RadioGroup className="flex gap-5">
                <Radio value={"postOnly"}>Post Only</Radio>
                <Radio value={"ioc"}>IOC</Radio>
                <Radio value={"fok"}>FOK</Radio>
              </RadioGroup>
            </div>
            <div className="flex gap-5">
              <div className="flex gap-2 items-center">
                <Checkbox id="orderConfirm" checked={props.showConfirm} />
                <Label htmlFor="orderConfirm">Order Confirm</Label>
              </div>
              <div className="flex gap-2 items-center">
                <Checkbox
                  id="hidden"
                  checked={props.values?.visible_quantity === 0}
                  onCheckedChange={(checked) => {
                    props.setValue?.("visible_quantity", checked ? 0 : 1);
                  }}
                />
                <Label htmlFor="hidden">Hidden</Label>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

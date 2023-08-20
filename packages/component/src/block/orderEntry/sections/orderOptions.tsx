import { Checkbox } from "@/checkbox";
import { Collapsible, CollapsibleContent } from "@/collapsible";
import { Label } from "@/label";
import { Radio, RadioGroup } from "@/radioGroup";
import { Switch } from "@/switch";
import { cn } from "@/utils/css";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const OrderOptions = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <div className="flex items-center py-1 justify-between">
        <div className="flex gap-2 items-center">
          <Switch id="reduceOnly" />
          <Label htmlFor="reduceOnly">Reduce Only</Label>
        </div>

        <button
          className="w-[18px] h-[18px] px-5 text-base-contrast/60"
          onClick={() => setOpen((open) => !open)}
        >
          <ChevronDown
            size={18}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      <Collapsible open={open}>
        <CollapsibleContent>
          <div className="pb-2 space-y-3">
            <div>
              <RadioGroup className="flex gap-5">
                <Radio value={"postOnly"}>Post Only</Radio>
                <Radio value={"ioc"}>IOC</Radio>
                <Radio value={"fok"}>FOK</Radio>
              </RadioGroup>
            </div>
            <div className="flex gap-5">
              <div className="flex gap-2 items-center">
                <Checkbox id="orderConfirm" />
                <Label htmlFor="orderConfirm">Order Confirm</Label>
              </div>
              <div className="flex gap-2 items-center">
                <Checkbox id="hidden" />
                <Label htmlFor="hidden">Hidden</Label>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

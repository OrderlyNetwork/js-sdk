import { Markets } from "@/block/markets";
import { ArrowIcon } from "@/icon";
import { Sheet, SheetContent, SheetTrigger } from "@/sheet";
import { ChevronDown } from "lucide-react";

export const Market = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={"flex items-center gap-1"}>
          <span>BTC-PERP</span>
          <ArrowIcon size={8} />
        </button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <Markets />
      </SheetContent>
    </Sheet>
  );
};

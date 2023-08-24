import { Markets } from "@/block/markets";
import { Sheet, SheetContent, SheetTrigger } from "@/sheet";
import { ChevronDown } from "lucide-react";

export const Market = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={"flex items-center"}>
          <span>BTC-PERP</span>
          <ChevronDown size={16} />
        </button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <Markets />
      </SheetContent>
    </Sheet>
  );
};

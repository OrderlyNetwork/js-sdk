import { Input } from "@/input";
import { usePositionsRowContext } from "./positionRowContext";
import { API } from "@orderly.network/types";
import { ArrowIcon } from "@/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { OrderType } from "@orderly.network/types";
import { cn } from "@/utils/css";

export const PriceInput = () => {
  const {
    price,
    position: posotion,
    updatePriceChange,
    type,
    updateOrderType,
  } = usePositionsRowContext();

  //   console.log("priceInput: render", price, posotion);

  const onFocus = () => {
    if (!!price && price !== "Market") return;
    updateOrderType(OrderType.LIMIT, posotion.mark_price.toString());
  };

  return (
    <Input
      size={"small"}
      onFocus={onFocus}
      value={type === OrderType.LIMIT ? price : "Market"}
      onChange={(e) => updatePriceChange(e.target.value)}
      className={cn("orderly-pr-0 orderly-font-semibold", {
        "orderly-text-base-contrast-54": type === OrderType.MARKET,
      })}
      suffix={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="orderly-px-1 orderly-h-full orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80">
              <ArrowIcon size={10} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="orderly-py-0 orderly-w-[92px] orderly-min-w-[92px]"
          >
            <DropdownMenuItem
              onSelect={(e) => {
                // console.log(e);
                updateOrderType(OrderType.MARKET);
              }}
              textValue={OrderType.MARKET}
            >
              Market
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
};

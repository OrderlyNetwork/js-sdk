import {
  CaretDownIcon,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
  inputFormatter,
} from "@orderly.network/ui";
import { usePositionsRowContext } from "./positionRowContext";
import { useState } from "react";
import { OrderType } from "@orderly.network/types";

export const PriceInput = () => {
  const { type, quoteDp, price, updatePriceChange, updateOrderType, position } =
    usePositionsRowContext();

  return (
    <DropdownMenuRoot>
      <Input
        size="sm"
        value={type === OrderType.LIMIT ? price : "Market"}
        onValueChange={(e) => updatePriceChange(e)}
        formatters={[
          inputFormatter.numberFormatter,
          ...(quoteDp ? [inputFormatter.dpFormatter(quoteDp)] : []),
        ]}
        onFocus={(e) => {
          if (type === OrderType.MARKET) {
            updateOrderType(OrderType.LIMIT, `${position.mark_price}`);
          }
        }}
        suffix={
          <DropdownMenuTrigger asChild>
            <button className="oui-px-1 oui-h-full">
              <CaretDownIcon size={12} color="white" />
            </button>
          </DropdownMenuTrigger>
        }
      />
      <DropdownMenuContent
        align="end"
        className="oui-w-[96px] oui-min-w-[96px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            size="xs"
            onSelect={(vent) => {
              updateOrderType(OrderType.MARKET);
            }}
          >
            <span>Market</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

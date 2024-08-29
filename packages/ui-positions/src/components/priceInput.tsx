import {
  CaretDownIcon,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
} from "@orderly.network/ui";
import { useState } from "react";

export enum PriceInputType {
  MARKET = "Market",
  LIMIT = "Limit",
}

export const PriceInput = () => {
  const [type, setType] = useState<PriceInputType>(PriceInputType.MARKET);
  return (
    <DropdownMenuRoot>
      <Input
        size="sm"
        autoComplete="off"
        value={type === PriceInputType.MARKET ? "Market" : ""}
        onFocus={() => {
          setType(PriceInputType.LIMIT);
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
            onSelect={() => {
              setType(PriceInputType.MARKET);
            }}
          >
            <span>Market</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

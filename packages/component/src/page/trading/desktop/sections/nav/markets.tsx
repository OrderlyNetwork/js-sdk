import { FC, useState } from "react";
import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { MemoizedMarkets } from "./myMarkets";
import {
  FavoriteIcon,
  UnFavoriteIcon,
} from "@/block/markets/full/favoriteButton";

export const Markets: FC<{ symbol: string }> = ({ symbol }) => {
  const [open, setOpen] = useState(false);
  // const [allMarkets] = useMarkets(MarketsType.ALL);

  // const curSymbol = useMemo(() => {
  //   const index = allMarkets.findIndex((item) => item.symbol === symbol);
  //   if (index === -1) {
  //     return {
  //       symbol: symbol,
  //       favorite: false,
  //     };
  //   }
  //   return {
  //     symbol: symbol,
  //     // @ ts-ignore
  //     favorite: allMarkets[index].isFavorite || false,
  //   }
  // }, [allMarkets, symbol]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="orderly-px-2 orderly-flex orderly-items-center orderly-gap-1 orderly-h-full">
          {/* {curSymbol.favorite ? <FavoriteIcon /> : <UnFavoriteIcon />} */}
          <NetworkImage type="symbol" symbol={symbol} size={"small"} />

          <Text
            rule="symbol"
            className="orderly-text-xs orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold"
          >
            {symbol}
          </Text>

          {/*@ts-ignore*/}
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        align={"start"}
        className="orderly-ui-markets-dropdown-menu-content orderly-w-[580px] orderly-p-0 orderly-bg-base-900 orderly-rounded-borderRadius orderly-shadow-[0px_12px_20px_0px_rgba(0,0,0,0.25)]"
      >
        <MemoizedMarkets onClose={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

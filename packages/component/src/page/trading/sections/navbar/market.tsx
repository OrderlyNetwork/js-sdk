import { FC, useCallback, useContext, useState } from "react";
import { Markets } from "@/block/markets";
import { ArrowIcon } from "@/icon";
import { Sheet, SheetContent, SheetTrigger } from "@/sheet";
import { useSymbolsInfo, useMarketsStream } from "@orderly.network/hooks";
import { TradingPageContext } from "@/page";

interface Props {
  symbol: string;
}

export const Market: FC<Props> = (props) => {
  const { symbol } = props;
  const [open, setOpen] = useState(false);

  const symbolConfig = useSymbolsInfo();
  const { data } = useMarketsStream();
  const { onSymbolChange } = useContext(TradingPageContext);

  const onSymbolClick = useCallback(
    (symbol: any) => {
      setOpen(false);
      onSymbolChange?.(symbol);
    },
    [onSymbolChange]
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className={"flex items-center gap-1"}>
          <span>{symbolConfig[symbol]("name")}</span>
          <ArrowIcon size={8} className="fill-base-contrast-54 " />
        </button>
      </SheetTrigger>
      <SheetContent
        side={"left"}
        closeable={false}
        className="w-[315px]"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Markets dataSource={data} onItemClick={onSymbolClick} />
      </SheetContent>
    </Sheet>
  );
};

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
        <button className="orderly-flex orderly-items-center orderly-gap-1">
          <span>{symbolConfig[symbol]("name")}</span>
          <ArrowIcon size={8} className="orderly-fill-base-contrast-54 orderly-" />
        </button>
      </SheetTrigger>
      <SheetContent
        side={"left"}
        closeable={false}
        className="orderly-w-84%"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Markets
          // @ts-ignore
          dataSource={data}
          onItemClick={onSymbolClick}
        />
      </SheetContent>
    </Sheet>
  );
};

import { FC, useCallback, useContext, useEffect, useState } from "react";
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

  const [innerHeight, setInnerHeight] = useState(window.innerHeight - 180);

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight - 180);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="orderly-flex orderly-items-center orderly-gap-1">
          <span>{symbolConfig[symbol]("name")}</span>
          <ArrowIcon size={8} className="orderly-fill-base-contrast-54" />
        </button>
      </SheetTrigger>
      <SheetContent
        id="orderly-markets-sheet-content"
        side={"left"}
        closeable={false}
        className="orderly-w-84% orderly-h-100vh"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Markets
          // @ts-ignore
          dataSource={data}
          onItemClick={onSymbolClick}
          listHeight={innerHeight}
        />
      </SheetContent>
    </Sheet>
  );
};

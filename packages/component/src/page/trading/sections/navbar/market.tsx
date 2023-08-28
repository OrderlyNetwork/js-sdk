import { FC } from "react";
import { Markets } from "@/block/markets";
import { ArrowIcon } from "@/icon";
import { Sheet, SheetContent, SheetTrigger } from "@/sheet";
import { useSymbolsInfo, useMarketsStream } from "@orderly.network/hooks";

interface Props {
  symbol: string;
}

export const Market: FC<Props> = (props) => {
  const { symbol } = props;

  const symbolConfig = useSymbolsInfo();
  const { data } = useMarketsStream();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={"flex items-center gap-1"}>
          <span>{symbolConfig[symbol]("name")}</span>
          <ArrowIcon size={8} />
        </button>
      </SheetTrigger>
      <SheetContent side={"left"} closeable={false}>
        <Markets dataSource={data} />
      </SheetContent>
    </Sheet>
  );
};

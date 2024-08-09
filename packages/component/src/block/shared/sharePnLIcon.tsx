import { PositionShareIcon } from "@/icon";
import { cn } from "@/utils";
import { FC, PropsWithChildren } from "react";
import { modal } from "@orderly.network/ui";
import { SharePoisitionView } from "./sharePosition";
import { useSymbolLeverage } from "@orderly.network/hooks";

export const SharePnLIcon: FC<
  PropsWithChildren<{
    className?: string;
    position: any;
  }>
> = (props) => {
  const leverage = useSymbolLeverage(props.position.symbol);

  return (
    <PositionShareIcon
      size={12}
      className={cn(
        "orderly-fill-white/20 hover:orderly-fill-white/80 hover:orderly-cursor-pointer orderly-inline-block",
        props.className
      )}
      fill="current"
      fillOpacity={1}
      onClick={() => {
        modal.show(SharePoisitionView, {
          position: props.position,
          leverage,
        });
      }}
    />
  );
};

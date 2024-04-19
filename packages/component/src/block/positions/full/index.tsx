import { Header } from "./header";
import { Divider } from "@/divider";
import { Listview } from "./listview";
import { FC } from "react";
import { PositionsViewProps } from "../shared/types";
import { AssetsProvider } from "@/provider";

export const PositionsViewFull: FC<
  Omit<PositionsViewProps, "onShowAllSymbolChange"> & {
    unPnlPriceBasis: any;
    setUnPnlPriceBasic: any;
    pnlNotionalDecimalPrecision: any;
}
> = (props) => {
  return (
    <div id="orderly-positions-desktop">
      <AssetsProvider>
        <Header aggregated={props.aggregated} pnlNotionalDecimalPrecision={props.pnlNotionalDecimalPrecision} />
      </AssetsProvider>
      <Divider />
      <Listview {...props} />
    </div>
  );
};

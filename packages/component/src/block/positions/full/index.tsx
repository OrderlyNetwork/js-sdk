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
}
> = (props) => {
  return (
    <>
      <AssetsProvider>
        <Header aggregated={props.aggregated} />
      </AssetsProvider>
      <Divider />
      <Listview {...props} />
    </>
  );
};

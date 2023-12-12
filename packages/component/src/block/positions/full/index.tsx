import { Header } from "./header";
import { Divider } from "@/divider";
import { Listview } from "./listview";
import { FC } from "react";
import { PositionsViewProps } from "../types";
import { AssetsProvider } from "@/provider";

export const PositionsViewFull: FC<
  Omit<PositionsViewProps, "onShowAllSymbolChange">
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

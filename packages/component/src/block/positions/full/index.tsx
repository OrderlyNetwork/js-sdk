import { Header } from "./header";
import { Divider } from "@/divider";
import { Listview } from "./listview";
import { FC } from "react";
import { PositionsViewProps } from "../types";

export const PositionsViewFull: FC<
  Omit<PositionsViewProps, "onShowAllSymbolChange">
> = (props) => {
  return (
    <>
      <Header aggregated={props.aggregated} />
      <Divider />
      <Listview {...props} />
    </>
  );
};

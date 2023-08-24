import { FC, useMemo } from "react";
import { ListTile, ListTileProps } from "./listTile";

export interface ListTileForSymbolProps
  extends Omit<ListTileProps, "title" | "avatar"> {
  symbol: string;
}

export const ListTileForSymbol: FC<ListTileForSymbolProps> = (props) => {
  const { symbol, ...rest } = props;

  const { coin, title } = useMemo(() => {
    const arr = symbol.split("_");
    return {
      coin: arr[1],
      title: `${arr[1]}-${arr[0]}`,
    };
  }, [symbol]);

  return (
    <ListTile
      {...rest}
      avatar={{
        type: "coin",
        name: coin,
      }}
      title={title}
    />
  );
};

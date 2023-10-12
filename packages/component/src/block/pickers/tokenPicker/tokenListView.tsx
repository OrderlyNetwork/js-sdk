import { Divider } from "@/divider";
import { NetworkImage } from "@/icon";
import { ListView } from "@/listView";
import { Table } from "@/table";
import { type API } from "@orderly.network/types";
import { FC, useMemo } from "react";
import { TokenCell } from "./tokenCell";

export interface TokenListViewProps {
  tokens: API.TokenInfo[];
  fetchBalance: (token: string) => Promise<any>;
  onItemClick: (token: API.TokenInfo) => void;
}

export const TokenListView: FC<TokenListViewProps> = (props) => {
  const renderItem = (item: API.TokenInfo) => {
    return (
      <TokenCell
        token={item}
        onItemClick={props.onItemClick}
        fetchBalance={props.fetchBalance}
      />
    );
  };
  const renderSeparator = () => {
    return <Divider />;
  };

  return (
    <>
      <div className="flex border-b border-base-contrast/20 py-2 mb-3">
        <span className="flex-1 text-xs text-base-contrast/50">Coin</span>
        <span className="flex-1 text-xs text-base-contrast/50">
          Wallet Balance
        </span>
      </div>
      <ListView.separated
        dataSource={props.tokens}
        renderItem={renderItem}
        renderSeparator={renderSeparator}
      />
    </>
  );

  //   return <Table columns={columns} dataSource={props.tokens} bordered />;
};

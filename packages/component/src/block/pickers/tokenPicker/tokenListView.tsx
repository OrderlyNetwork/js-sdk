import { FC } from "react";
import { Divider } from "@/divider";
import { ListView } from "@/listView";
import { TokenCell } from "./tokenCell";
import { type API } from "@orderly.network/types";

export interface TokenListViewProps {
  tokens: API.TokenInfo[];
  fetchBalance: (token: string, decimals: number) => Promise<any>;
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
      <div className="orderly-token-select-list-header orderly-flex orderly-border-b orderly-border-base-contrast/20 orderly-py-2 orderly-mb-3">
        <span className="orderly-flex-1 orderly-text-4xs orderly-text-base-contrast/50">
          Coin
        </span>
        <span className="orderly-flex-1 orderly-text-4xs orderly-text-base-contrast/50">
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
};

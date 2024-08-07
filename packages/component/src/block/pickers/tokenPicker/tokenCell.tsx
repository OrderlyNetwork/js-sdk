import { FC } from "react";
import { NetworkImage } from "@/icon";
import { Spinner } from "@/spinner";
import { Numeral } from "@/text";
import { API } from "@orderly.network/types";
import { useGetBalance } from "./useGetBalance";
interface TokenCellProps {
  token: API.TokenInfo;
  fetchBalance: (token: string, decimals: number) => Promise<any>;
  onItemClick: (token: API.TokenInfo) => void;
}

export const TokenCell: FC<TokenCellProps> = (props) => {
  const { token } = props;
  const { balance, loading } = useGetBalance(token, props.fetchBalance);

  return (
    <div
      className="orderly-token-select-list-item orderly-flex orderly-cursor-pointer hover:orderly-bg-base-800"
      onClick={() => {
        props.onItemClick(token);
      }}
    >
      <div className="orderly-flex-1 orderly-flex orderly-space-x-2 orderly-items-center">
        <NetworkImage type={"token"} name={token.symbol} rounded />
        <div className="orderly-token-select-list-item-left orderly-flex orderly-flex-col">
          <span>{token.symbol}</span>
          <span className="orderly-text-4xs orderly-text-base-contrast/50">
            {token.symbol}
          </span>
        </div>
      </div>
      <div className="orderly-token-select-list-item-right orderly-flex-1 orderly-flex orderly-items-center">
        {loading ? (
          <Spinner size={"small"} />
        ) : (
          <Numeral precision={token.precision || 2} padding={false}>
            {balance}
          </Numeral>
        )}
      </div>
    </div>
  );
};

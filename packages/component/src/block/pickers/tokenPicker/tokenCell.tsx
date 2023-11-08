import { NetworkImage } from "@/icon";
import { Spinner } from "@/spinner";
import { Numeral } from "@/text";
import { API } from "@orderly.network/types";
import { FC, useEffect, useState } from "react";

interface TokenCellProps {
  token: API.TokenInfo;
  fetchBalance: (token: string, decimals: number) => Promise<any>;
  onItemClick: (token: API.TokenInfo) => void;
}

export const TokenCell: FC<TokenCellProps> = (props) => {
  const { token } = props;

  const [balance, setBalance] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loading) return;
    setLoading(true);
    props
      .fetchBalance(token.address, token.decimals)
      .then(
        (balance) => {
          setBalance(balance);
        },
        (error) => {}
      )
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div
      className="flex cursor-pointer hover:bg-base-800"
      onClick={() => {
        props.onItemClick(token);
      }}
    >
      <div className="flex-1 flex space-x-2 items-center">
        <NetworkImage type={"token"} name={token.symbol} rounded />
        <div className="flex flex-col">
          <span>{token.symbol}</span>
          <span className="text-xs text-base-contrast/50">{token.symbol}</span>
        </div>
      </div>
      <div className="flex-1 flex items-center">
        {loading ? (
          <Spinner size={"small"} />
        ) : (
          <Numeral precision={token.woofi_dex_precision} padding={false}>
            {balance}
          </Numeral>
        )}
      </div>
    </div>
  );
};

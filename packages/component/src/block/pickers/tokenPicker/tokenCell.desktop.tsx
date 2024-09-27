import { FC } from "react";
import { NetworkImage } from "@/icon";
import { Spinner } from "@/spinner";
import { Numeral } from "@/text";
import { API } from "@orderly.network/types";
import { useGetBalance } from "./useGetBalance";

interface TokenCellProps {
  token: API.TokenInfo;
  fetchBalance: (token: string, decimals: number) => Promise<any>;
}

export const DesktopTokenCell: FC<TokenCellProps> = (props) => {
  const { token } = props;
  const { balance, loading } = useGetBalance(token, props.fetchBalance);

  return (
    <div className="orderly-token-select-dropdown-menu-item orderly-cursor-pointer hover:orderly-bg-base-contrast/5 orderly-font-semibold orderly-p-3">
      <div className="orderly-flex orderly-items-center orderly-h-[20px] orderly-rounded-sm">
        <NetworkImage size={16} type="token" name={token.symbol} rounded />
        <div className="orderly-text-2xs orderly-text-base-contrast orderly-ml-2">
          {token.symbol}
        </div>
      </div>

      <div className="orderly-flex orderly-items-center orderly-text-3xs orderly-text-base-contrast/50 orderly-leading-[20px]">
        <span className="orderly-mr-1">Available:</span>
        {loading ? (
          <Spinner
            size={"small"}
            className="orderly-w-[16px] orderly-h-[16px]"
          />
        ) : (
          <div className="orderly-flex orderly-items-center">
            <Numeral precision={token.precision || 2} padding={false}>
              {balance}
            </Numeral>
            <span className="orderly-text-4xs orderly-ml-1">
              {token.symbol}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

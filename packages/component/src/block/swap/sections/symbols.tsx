import { NetworkImage } from "@/icon";
import { parseNumber } from "@/utils/num";
import { ArrowRight } from "lucide-react";
import { FC, useMemo } from "react";

export type SymbolInfo = {
  chain: number;
  token: string;
  displayDecimals: number;
  amount: string;
  decimals: number;
};

export interface SwapSymbolsProps {
  from: SymbolInfo;
  to: SymbolInfo;
  swapInfo: any;
}

export const SwapSymbols: FC<SwapSymbolsProps> = (props) => {
  const { from, to } = props;

  const fromAmount = useMemo(() => {
    return parseNumber(from.amount, {
      precision: from.displayDecimals,
    });
  }, [from.amount]);

  const toAmount = useMemo(() => {
    return parseNumber(to.amount, {
      precision: to.displayDecimals,
    });
  }, [to.amount]);

  return (
    <div className="orderly-flex orderly-items-center orderly-justify-between">
      <div className="orderly-flex orderly-gap-3 orderly-items-center">
        <NetworkImage.combine
          main={{
            name: from.token,
            type: "token",
            size: "large",
          }}
          sub={{
            id: from.chain,
            type: "chain",
            size: "small",
          }}
        />
        <div className="orderly-flex orderly-flex-col">
          <span className="orderly-text-base desktop:orderly-text-lg">
            {fromAmount}
          </span>
          <span className="orderly-text-3xs desktop:orderly-text-2xs orderly-text-base-contrast-54">
            {props.from.token}
          </span>
        </div>
      </div>
      <ArrowRight className="orderly-text-primary-light" size={30} />
      <div className="orderly-flex orderly-gap-3 orderly-items-center">
        <div className="orderly-flex orderly-flex-col orderly-items-end">
          <span className="orderly-text-base desktop:orderly-text-lg">
            {toAmount}
          </span>
          <span className="orderly-text-3xs desktop:orderly-text-2xs orderly-text-base-contrast-54">
            {props.to.token}
          </span>
        </div>
        <NetworkImage.combine
          main={{
            name: to.token,
            type: "token",
            size: "large",
          }}
          sub={{
            // id: to.chain,
            path: "/images/woofi-little.svg",
            type: "path",
            size: "small",
          }}
        />
      </div>
    </div>
  );
};

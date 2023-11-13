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
    <div className="flex items-center justify-between">
      <div className="flex gap-3 items-center">
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
        <div className="flex flex-col">
          <span>{fromAmount}</span>
          <span className="text-4xs text-base-contrast/50">
            {props.from.token}
          </span>
        </div>
      </div>
      <ArrowRight className="text-primary-light" size={30} />
      <div className="flex gap-3 items-center">
        <div className="flex flex-col items-end">
          <span>{toAmount}</span>
          <span className="text-4xs text-base-contrast/50">
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

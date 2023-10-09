import { NetworkImage } from "@/icon";
import { ArrowRight } from "lucide-react";
import { FC } from "react";

export type SymbolInfo = {
  chain: number;
  token: string;
};

export interface SwapSymbolsProps {
  from: SymbolInfo;
  to: SymbolInfo;
}

export const SwapSymbols: FC<SwapSymbolsProps> = (props) => {
  const { from, to } = props;
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3 items-center">
        <NetworkImage.combine
          main={{
            id: from.chain,
            type: "chain",
            size: "large",
          }}
          sub={{
            name: from.token,
            type: "token",
            size: "small",
          }}
        />
        <div className="flex flex-col">
          <span>0.0832</span>
          <span className="text-xs text-base-contrast/50">BNB</span>
        </div>
      </div>
      <ArrowRight className="text-primary-light" size={30} />
      <div className="flex gap-3 items-center">
        <div className="flex flex-col items-end">
          <span>0.0832</span>
          <span className="text-xs text-base-contrast/50">BNB</span>
        </div>
        <NetworkImage.combine
          main={{
            id: to.chain,
            type: "chain",
            size: "large",
          }}
          sub={{
            name: to.token,
            type: "token",
            size: "small",
          }}
        />
      </div>
    </div>
  );
};

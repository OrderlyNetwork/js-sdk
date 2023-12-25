import { Sheet } from "@/sheet";
import { ListView } from "@/listView";
import { FC, useCallback, useMemo } from "react";
import { Divider } from "@/divider";
import { ChainCell } from "./chainCell";
import { type API } from "@orderly.network/types";

type ChainInfo = API.NetworkInfos & {
  bridgeless: boolean;
};

export interface ChainListViewProps {
  mainChains?: ChainInfo[];
  testChains?: ChainInfo[];
  currentChainId?: number;
  value?: any;
  onItemClick?: (value: any) => void;
}

export const ChainListView: FC<ChainListViewProps> = (props) => {
  const mainnet = useMemo(() => {
    if (!props.mainChains || props.mainChains.length === 0) {
      return null;
    }

    return (
      <>
        {props.testChains && props.testChains.length > 0 && (
          <div className="orderly-uppercase orderly-text-base-contrast/50 orderly-text-4xs orderly-mb-2 desktop:orderly-ml-3">
            mainnet
          </div>
        )}
        <div className="orderly-flex orderly-flex-col">
          {props.mainChains.map((chain, index) => {
            return (
              <ChainCell
                key={chain.chain_id}
                name={chain.name}
                id={chain.chain_id}
                onClick={props.onItemClick}
                bridgeless={chain.bridgeless}
                selected={props.currentChainId === chain.chain_id}
              />
            );
          })}
        </div>
      </>
    );
  }, [props.mainChains, props.testChains, props.currentChainId]);

  const testnet = useMemo(() => {
    if (!props.testChains || props.testChains.length === 0) {
      return null;
    }

    return (
      <>
        {props.mainChains && props.mainChains.length > 0 && (
          <div className="orderly-uppercase orderly-text-base-contrast/50 orderly-text-4xs orderly-mb-2 desktop:orderly-ml-3">
            testnet
          </div>
        )}
        <div className="orderly-flex orderly-flex-col">
          {props.testChains.map((chain, index) => {
            return (
              <ChainCell
                key={chain.chain_id}
                name={chain.name}
                id={chain.chain_id}
                onClick={props.onItemClick}
                bridgeless={chain.bridgeless}
                selected={props.currentChainId === chain.chain_id}
              />
            );
          })}
        </div>
      </>
    );
  }, [props.testChains, props.mainChains, props.currentChainId]);

  return (
    <div className="orderly-chain-list orderly-pt-5 desktop:orderly-pt-2">
      {mainnet}
      {testnet}
    </div>
  );
};

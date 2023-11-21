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
          <div className="uppercase text-base-contrast/50 text-4xs mb-2">
            mainnet
          </div>
        )}
        <div className="flex flex-col">
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
          <div className="uppercase text-base-contrast/50 text-4xs mb-2">
            testnet
          </div>
        )}
        <div className="flex flex-col">
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
    <div className="pt-5">
      {mainnet}
      {testnet}
    </div>
  );
};

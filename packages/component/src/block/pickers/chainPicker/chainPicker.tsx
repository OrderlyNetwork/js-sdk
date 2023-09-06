import { Sheet } from "@/sheet";
import { ListView } from "@/listView";
import { FC, useCallback, useMemo } from "react";
import { Divider } from "@/divider";
import { ChainCell } from "./chainCell";
import { type API } from "@orderly.network/types";

export interface ChainPickerProps {
  mainnetChains: API.NetworkInfos[];
  testChains: API.NetworkInfos[];
  value?: any;
  onChange?: (value: any) => void;
}

export const ChainPicker: FC<ChainPickerProps> = (props) => {
  const mainnet = useMemo(() => {
    if (!props.mainnetChains || props.mainnetChains.length === 0) {
      return null;
    }

    return (
      <>
        <div className="uppercase text-base-contrast/50 text-xs mb-2">
          mainnet
        </div>
        <div className="flex flex-col">
          {props.mainnetChains.map((chain, index) => {
            return (
              <ChainCell
                key={chain.chain_id}
                name={chain.name}
                id={chain.chain_id}
              />
            );
          })}
        </div>
      </>
    );
  }, [props.mainnetChains]);

  const testnet = useMemo(() => {
    if (!props.testChains || props.testChains.length === 0) {
      return null;
    }

    return (
      <>
        <div className="uppercase text-base-contrast/50 text-xs mb-2">
          testnet
        </div>
        <div className="flex flex-col">
          {props.testChains.map((chain, index) => {
            return (
              <ChainCell
                key={chain.chain_id}
                name={chain.name}
                id={chain.chain_id}
                onClick={props.onChange}
              />
            );
          })}
        </div>
      </>
    );
  }, [props.testChains]);

  return (
    <div className="pt-5">
      {mainnet}
      {testnet}
    </div>
  );
};

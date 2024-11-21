import { Input } from "@/input";
import { FC, useContext, useMemo } from "react";
import { API, Chain, CurrentChain } from "@orderly.network/types";
import { ChainSelect } from "../chainPicker";
import { OrderlyContext } from "@orderly.network/hooks";
import { Chains } from "@orderly.network/hooks";

export type Wallet = {
  // token: string;
  address: string;

  icon: string;
  label: string;
};

export interface WalletPickerProps {
  // chains?: API.ChainDetail[];

  chain: CurrentChain | null;

  address?: string;

  settingChain?: boolean;

  onOpenPicker?: () => void;
  onChainChange?: (chain: any) => void;
  onChainInited?: (chain: API.Chain) => void;
  chains?: Chains<undefined, undefined>;
}

export const WalletPicker: FC<WalletPickerProps> = (props) => {
  const { chain, chains } = props;

  const address = useMemo(() => {
    if (!props.address) return "--";
    return props.address.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
  }, [props.address]);

  //

  return (
    <div className="orderly-flex orderly-gap-2">
      <Input
        className="orderly-wallet-picker orderly-text-4xs orderly-text-base-contrast-36 desktop:orderly-text-3xs"
        containerClassName="orderly-bg-base-500 orderly-rounded-borderRadius"
        disabled
        value={address}
        fullWidth
      />
      <ChainSelect
        value={chain}
        onValueChange={props.onChainChange}
        onChainInited={props.onChainInited}
        settingChain={props.settingChain}
        chains={props.chains}
      />
    </div>
  );
};

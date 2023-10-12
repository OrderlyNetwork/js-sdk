import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import { ArrowLeftRight } from "lucide-react";
import { NetworkImage } from "@/icon/networkImage";
import { FC, useCallback, useMemo } from "react";
import { API, ChainConfig, ChainInfo, chainsMap } from "@orderly.network/types";
import { modal } from "@/modal";
import { ChainSelect } from "../chainPicker";

export type Wallet = {
  // token: string;
  address: string;

  icon: string;
  label: string;
};

export interface WalletPickerProps {
  // chains?: API.ChainDetail[];

  chain?: ChainConfig;

  address?: string;

  networkId?: "mainnet" | "testnet";
  settingChain?: boolean;

  onOpenPicker?: () => void;
  onChainChange?: (chain: any) => void;
  onChainInited?: (chain: API.Chain) => void;
}

export const WalletPicker: FC<WalletPickerProps> = (props) => {
  const { chain } = props;
  const address = useMemo(() => {
    if (!props.address) return "--";
    return props.address.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
  }, [props.address]);

  // console.log(props);

  return (
    <div className={"flex gap-2"}>
      <Input disabled value={address} fullWidth />
      <ChainSelect
        value={chain}
        onValueChange={props.onChainChange}
        onChainInited={props.onChainInited}
        settingChain={props.settingChain}
      />
    </div>
  );
};

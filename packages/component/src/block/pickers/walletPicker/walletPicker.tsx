import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import { ArrowLeftRight } from "lucide-react";
import { NetworkImage } from "@/icon/networkImage";
import { FC, useCallback, useMemo } from "react";
import { API, ChainConfig, ChainInfo, chainsMap } from "@orderly.network/types";
import { modal } from "@/modal";

export type Wallet = {
  // token: string;
  address: string;

  icon: string;
  label: string;
};

export interface WalletPickerProps {
  chains?: API.ChainDetail[];

  chain?: ChainConfig;

  address?: string;
  onOpenPicker?: () => void;
  onChainChange?: (chainId: string) => void;
}

export const WalletPicker: FC<WalletPickerProps> = (props) => {
  const { chain } = props;
  const address = useMemo(() => {
    if (!props.address) return "--";
    return props.address.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
  }, [props.address]);

  const onClick = useCallback(() => {
    console.log("open dialog");
    modal;
  }, []);

  // console.log(props);

  return (
    <div className={"flex gap-2"}>
      <Input disabled value={address} fullWidth />
      <button
        className="flex w-full items-center px-2 rounded bg-fill"
        disabled={(props.chains?.length ?? 0) < 2}
        onClick={onClick}
      >
        <NetworkImage
          id={chain?.id}
          type={props.chain ? "chain" : "placeholder"}
          size={"small"}
          rounded
        />
        <span className="flex-1 px-2 text-left">
          {chain?.chainName ?? "--"}
        </span>
        {props.chains?.length && props.chains.length > 1 && (
          <ArrowLeftRight size={16} className="text-primary-light" />
        )}
      </button>
    </div>
  );
};

import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import { ArrowLeftRight } from "lucide-react";
import { NetworkImage } from "@/icon/networkImage";
import { FC, useMemo } from "react";

export type Wallet = {
  // token: string;
  address: string;

  icon: string;
  label: string;
};

export type Chain = {
  chainId: number;
  chainName: string;
};

export interface WalletPickerProps {
  chains?: Chain[];
  activeChain?: Chain;
  wallet?: Wallet;
}

export const WalletPicker: FC<WalletPickerProps> = (props) => {
  const address = useMemo(() => {
    if (!props.wallet?.address) return "--";
    return props.wallet.address.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
  }, [props.wallet?.address]);
  return (
    <div className={"flex gap-2"}>
      <Input disabled value={address} fullWidth />
      <Input
        fullWidth
        value={props.activeChain?.chainName ?? "--"}
        readOnly
        prefix={
          <InputMask>
            <NetworkImage
              id={props.activeChain?.chainId}
              type={props.activeChain ? "chain" : "placeholder"}
              size={"small"}
              rounded
            />
          </InputMask>
        }
        suffix={
          Array.isArray(props.chains) && props.chains?.length > 1 ? (
            <InputMask>
              <ArrowLeftRight size={16} />
            </InputMask>
          ) : null
        }
      />
    </div>
  );
};

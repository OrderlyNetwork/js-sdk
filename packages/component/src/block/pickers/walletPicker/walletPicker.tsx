import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import { ArrowLeftRight } from "lucide-react";
import { NetworkImage } from "@/icon/networkImage";

export interface WalletPickerProps {
  chains?: any[];
}

export const WalletPicker = () => {
  return (
    <div className={"flex gap-2"}>
      <Input disabled value={"a0x91739C5335......E7c4e"} fullWidth />
      <Input
        fullWidth
        value={"BNB Chain"}
        readOnly
        prefix={
          <InputMask>
            <NetworkImage name={"BTC"} type={"coin"} />
          </InputMask>
        }
        suffix={
          <InputMask>
            <ArrowLeftRight size={16} />
          </InputMask>
        }
      />
    </div>
  );
};

import { Input, InputProps } from "@/input";
import { InputMask } from "@/input/inputMask";
import { NetworkImage } from "@/icon/networkImage";
import { ChangeEvent, FC, useCallback, useState } from "react";

export interface TokenQtyInputProps extends InputProps {
  token?: string;
  onTokenChange?: (token: string) => void;
  onValueChange?: (value: { value: string; token: string }) => void;
}

export const TokenQtyInput: FC<TokenQtyInputProps> = (props) => {
  const { onChange, onValueChange, onTokenChange, ...rest } = props;
  const [token, setToken] = useState(props.token);

  const _onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.log(event.target.value);
      props?.onValueChange?.({
        value: event.target.value,
        token: token!,
      });
    },
    [token]
  );

  return (
    <Input
      {...props}
      onChange={_onChange}
      placeholder={"Quantity"}
      suffix={
        <InputMask className={"flex-row items-center gap-2 border-l h-[80%]"}>
          <NetworkImage name={"USDC"} type={"coin"} size={"small"} />
          <span>USDC</span>
        </InputMask>
      }
    />
  );
};

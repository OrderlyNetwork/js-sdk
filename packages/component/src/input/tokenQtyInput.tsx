import { Input, InputProps } from "@/input";
import { InputMask } from "@/input/inputMask";
import { NetworkImage } from "@/icon/networkImage";
import { ChangeEvent, FC, useCallback, useMemo, useState } from "react";
import { Divider } from "@/divider";
import { Decimal, commify } from "@orderly.network/utils";

export interface TokenQtyInputProps extends InputProps {
  token?: string;

  amount?: string;
  fee: number;

  onTokenChange?: (token: string) => void;
  onValueChange?: (value: { value: string; token: string }) => void;
}

export const TokenQtyInput: FC<TokenQtyInputProps> = (props) => {
  const { onChange, onValueChange, onTokenChange, ...rest } = props;
  const [token, setToken] = useState(props.token);

  const _onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      console.log(event.target.value);
      // props?.onValueChange?.({
      //   value: event.target.value,
      //   token: token!,
      // });
    },
    [token]
  );

  const amount = useMemo(() => {
    if (!props.amount) return "";
    const num = Number(props.amount);
    if (isNaN(num)) return "";
    if (num <= 0) return "";
    return commify(new Decimal(props.amount).sub(props.fee).toString());
  }, [props.amount, props.fee]);

  return (
    <Input
      {...props}
      onChange={_onChange}
      placeholder={"Quantity"}
      readOnly
      value={amount}
      suffix={
        <InputMask className={"flex-row items-center gap-2"}>
          <Divider vertical />
          <NetworkImage name={"USDC"} type={"token"} size={"small"} />
          <span>USDC</span>
        </InputMask>
      }
    />
  );
};

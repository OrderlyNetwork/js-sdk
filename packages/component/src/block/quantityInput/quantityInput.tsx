import Button from "@/button";
import { ChangeEvent, FC, useCallback, useMemo, useRef } from "react";
import { type API } from "@orderly.network/core";
import { NetworkImage } from "@/icon/networkImage";
import { ChevronDown } from "lucide-react";
import { Divider } from "@/divider";
import { cn } from "@/utils/css";
import { Decimal } from "@orderly.network/utils";

export type InputStatus = "error" | "warning" | "success" | "default";

export interface QuantityInputProps {
  maxAmount?: number;
  tokens: API.Token[];
  token?: API.Token;
  quantity?: string;
  decimals: number;
  onTokenChange?: (token: string) => void;
  // onMaxClick?: () => void;
  onValueChange?: (value: { value: string; token: string }) => void;
  className?: string;
  // errorMessages?: string;
  status?: InputStatus;
  hintMessage?: string;
}
export const QuantityInput: FC<QuantityInputProps> = (props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const amount = useMemo(() => {
    return new Decimal(props.quantity || 0)
      .mul(1)
      .todp(props.decimals)
      .toString();
  }, [props.quantity, props.decimals]);

  return (
    <>
      <div
        className={cn(
          "bg-fill dark:bg-base-300 rounded pl-1 pr-2 py-2 focus-within:bg-fill focus-within:outline focus-within:outline-1 outline-primary",
          props.className,
          {
            "outline outline-1 outline-danger": props.status === "error",
            "outline outline-1 outline-yellow-200": props.status === "warning",
          }
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex">
          <div className="flex-1 flex justify-between">
            <input
              type="text"
              inputMode="decimal"
              ref={inputRef}
              value={props.quantity}
              // onChange={onChange}
              onChange={(event) => {
                // console.log(event.target.value);
                props?.onValueChange?.({
                  value: event.target.value,
                  token: props.token?.token ?? "",
                });
              }}
              className={
                "bg-transparent h-full flex-1 px-2 focus-visible:outline-none font-semibold placeholder:text-base-contrast/20"
              }
              placeholder={"Quantity"}
            />

            <Button
              variant={"text"}
              size={"small"}
              className={"font-semibold text-primary-light px-2 min-w-[40px]"}
              disabled={!props.maxAmount}
              onClick={() => {
                props?.onValueChange?.({
                  value: `${props.maxAmount ?? 0}`,
                  token: props.token?.token ?? "",
                });
              }}
            >
              MAX
            </Button>
          </div>
          <Divider vertical />
          <div
            className={
              "flex items-center gap-1 text-sm text-base-contrast/80 mr-2"
            }
          >
            <NetworkImage type={"token"} name={"USDC"} size={"small"} />
            <span>USDC</span>
            {/*<ChevronDown size={16} />*/}
          </div>
        </div>
        <div
          className={
            "flex items-center text-sm justify-between px-2 py-1 text-base-contrast/30"
          }
        >
          <span>{`$${amount}`}</span>
          <div>{`Available: ${props.maxAmount ?? "-"} USDC`}</div>
        </div>
      </div>
      {props.hintMessage && (
        <div
          className={cn(
            "mt-2 text-sm relative before:block pl-3 before:w-[4px] before:rounded-[4px] before:h-[4px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
            {
              "text-danger": props.status === "error",
              "before:bg-danger": props.status === "error",
              "text-warning": props.status === "warning",
            }
          )}
        >
          {props.hintMessage}
        </div>
      )}
    </>
  );
};

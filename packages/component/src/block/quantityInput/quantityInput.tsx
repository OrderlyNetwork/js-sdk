import Button from "@/button";
import { FC, useMemo, useRef } from "react";

import { Divider } from "@/divider";
import { cn } from "@/utils/css";
import { Decimal } from "@orderly.network/utils";
import { TokenSelect } from "./tokenSelect";
import { type API } from "@orderly.network/types";
import { Spinner } from "@/spinner";
import { parseNumber } from "@/utils/num";

export type InputStatus = "error" | "warning" | "success" | "default";

export interface QuantityInputProps {
  disabled?: boolean;
  maxAmount?: number;
  tokens: API.TokenInfo[];
  token?: API.TokenInfo;
  quantity?: string;
  decimals: number;
  // markPrices: MarkPrices;
  markPrice: number;

  onTokenChange?: (token: API.TokenInfo) => void;
  // onMaxClick?: () => void;
  onValueChange?: (value: { value: string; token: string }) => void;
  className?: string;
  // errorMessages?: string;
  status?: InputStatus;
  hintMessage?: string;
  balanceRevalidating?: boolean;
  fetchBalance: (token: string, decimals: number) => Promise<any>;
}
export const QuantityInput: FC<QuantityInputProps> = (props) => {
  const { disabled } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const amount = useMemo(() => {
    return (
      new Decimal(props.quantity || 0)
        .mul(props.markPrice)
        // .todp(props.decimals)
        .todp(Math.abs((props.token?.woofi_dex_precision ?? 2) - 5))
        .toString()
    );
  }, [props.quantity, props.token?.woofi_dex_precision, props.markPrice]);

  return (
    <>
      <div
        className={cn(
          "bg-base-500 dark:bg-base-100 rounded pl-1 pr-2 py-2 focus-within:bg-bg-base-500 focus-within:outline focus-within:outline-1 outline-primary",
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
              disabled={disabled}
              value={props.quantity}
              // onChange={onChange}
              onChange={(event) => {
                //
                props?.onValueChange?.({
                  value: event.target.value,
                  token: props.token?.symbol ?? "",
                });
              }}
              className={
                "bg-transparent h-full flex-1 px-2 focus-visible:outline-none font-semibold text-sm text-base-contrast placeholder:text-base-contrast-36"
              }
              placeholder={"Quantity"}
            />

            <Button
              variant={"text"}
              size={"small"}
              className={"font-semibold text-primary-light px-2 min-w-[40px] text-3xs"}
              disabled={!props.maxAmount}
              onClick={(event) => {
                props?.onValueChange?.({
                  value: parseNumber(props.maxAmount ?? 0, {
                    precision: props.token?.woofi_dex_precision,
                  }),
                  token: props.token?.symbol ?? "",
                });
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              MAX
            </Button>
          </div>
          <Divider vertical />
          <TokenSelect
            tokens={props.tokens}
            token={props.token}
            fetchBalance={props.fetchBalance}
            onTokenChange={props.onTokenChange}
            disabled={disabled}
            onClosed={() => inputRef.current?.focus()}
          />
        </div>
        <div
          className={
            "flex items-center text-4xs justify-between px-2 py-1 text-base-contrast-36"
          }
        >
          <span>{`$${amount}`}</span>
          <div className="flex items-center space-x-2">
            <span>{`Available: ${
              parseNumber(props.maxAmount ?? 0, {
                precision: props.token?.woofi_dex_precision,
                rule: "price",
              }) ?? "-"
            } ${props.token?.symbol ?? ""}`}</span>
            {props.balanceRevalidating && <Spinner size={"small"} />}
          </div>
        </div>
      </div>
      {props.hintMessage && (
        <div
          className={cn(
            "mt-2 text-4xs relative before:block pl-3 before:w-[4px] before:rounded-[4px] before:h-[4px] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
            {
              "text-danger-light": props.status === "error",
              "before:bg-danger-light": props.status === "error",
              "text-warning-light": props.status === "warning",
            }
          )}
        >
          {props.hintMessage}
        </div>
      )}
    </>
  );
};

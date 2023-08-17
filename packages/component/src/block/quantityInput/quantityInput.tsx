import Button from "@/button";
import { FC, useRef } from "react";
import { type API } from "@orderly/core";
import { NetworkImage } from "@/icon/networkImage";
import { ChevronDown } from "lucide-react";
import { Divider } from "@/divider";
import { cn } from "@/utils/css";

export interface QuantityInputProps {
  availableBalances?: number;
  tokens: API.Token[];
  token?: API.Token;
  quantity?: string;
  onTokenChange?: (token: string) => void;
  onMaxClick?: () => void;
  onValueChange?: (value: { value: string; token: string }) => void;
  className?: string;
  // errorMessages?: string;
  status?: "error" | "warning" | "success" | "default";
}
export const QuantityInput: FC<QuantityInputProps> = (props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
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
            ref={inputRef}
            value={props.quantity}
            onChange={(event) => {
              // console.log(event.target.value);
              props?.onValueChange?.({
                value: event.target.value,
                token: props.token?.token ?? "",
              });
            }}
            className={
              "bg-transparent h-full flex-1 px-2 focus-visible:outline-none font-semibold"
            }
            placeholder={"Quantity"}
          />

          <Button
            variant={"text"}
            size={"small"}
            className={"font-semibold"}
            disabled={!props.availableBalances}
            onClick={() => props.onMaxClick?.()}
          >
            MAX
          </Button>
        </div>
        <Divider vertical />
        <Button
          variant={"text"}
          size={"small"}
          className={"flex items-center gap-1 text-base-contrast"}
        >
          <NetworkImage type={"coin"} name={"USDC"} size={"small"} />
          <span>USDC</span>
          {/*<ChevronDown size={16} />*/}
        </Button>
      </div>
      <div
        className={
          "flex items-center text-sm justify-between px-2 py-1 text-tertiary"
        }
      >
        <span>{`$${props.quantity ?? 0}`}</span>
        <div>{`Available: ${props.availableBalances ?? "-"} USDC`}</div>
      </div>
    </div>
  );
};

import Button from "@/button";
import { FC, useRef } from "react";

export interface QuantityInputProps {
  available?: string;
  tokens: any[];
  onTokenChange?: (token: string) => void;
  onValueChange?: (value: { value: string; token: string }) => void;
}
export const QuantityInput: FC<QuantityInputProps> = (props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="bg-slate-300 rounded pl-1 pr-2 py-2 focus-within:bg-amber-300"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex">
        <div className="flex-1 flex justify-between">
          <input
            type="text"
            ref={inputRef}
            className={
              "bg-transparent h-full flex-1 px-2 focus-visible:outline-none"
            }
            placeholder={"Quantity"}
          />

          <Button variant={"text"} size={"small"}>
            Max
          </Button>
        </div>
        <div>Token Picker</div>
      </div>
      <div className={"flex items-center justify-between px-2"}>
        <span>$0</span>
        <div>Available:3500 USDC</div>
      </div>
    </div>
  );
};

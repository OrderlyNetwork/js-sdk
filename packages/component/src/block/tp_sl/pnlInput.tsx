import { Input } from "@/input";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { ArrowIcon } from "@/icon";
import { useLocalStorage } from "@orderly.network/hooks";
import { cn } from "@/utils";
import { Decimal, commify } from "@orderly.network/utils";

interface Props {
  type: "TP" | "SL";
  quote: string;
  quote_db?: number;
  onChange: (key: string, value: number | string) => void;
  testId?: string;
  values: {
    PnL: string;
    Offset: string;
    "Offset%": string;
  };
}

export enum PnLMode {
  PnL = "PnL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export const PnlInput: FC<Props> = (props) => {
  const { quote, type, quote_db = 2 } = props;
  const [mode, setMode] = useLocalStorage<PnLMode>(
    "TP/SL_Mode",
    PnLMode.PERCENTAGE
  );

  const percentageSuffix = useRef<string>("");

  const key = useMemo(() => {
    switch (mode) {
      case PnLMode.OFFSET:
        return `${type.toLowerCase()}_offset`;
      case PnLMode.PERCENTAGE:
        return `${type.toLowerCase()}_offset_percentage`;
      default:
        return `${type.toLowerCase()}_pnl`;
    }
  }, [mode]);

  const value = useMemo(() => {
    const val = props.values[mode as keyof Props["values"]];

    // console.log("val", val);

    if (val === "") return val;

    if (mode === PnLMode.PnL || mode === PnLMode.OFFSET) {
      return commify(val);
    }

    if (mode === PnLMode.PERCENTAGE) {
      return `${new Decimal(val).mul(100).todp(2, 4).toString()}${
        percentageSuffix.current
      }`;
      // return (Number(val) * 100).toFixed(2);
    }

    return val;
  }, [props.values, mode]);

  const pnlNumber = Number(props.values.PnL);

  return (
    <Input
      prefix={mode}
      placeholder={mode === PnLMode.PERCENTAGE ? "%" : quote}
      className={cn(
        "orderly-text-right oorderly-text-3xs orderly-caret-white placeholder:orderly-text-3xs",
        pnlNumber > 0
          ? "orderly-text-trade-profit"
          : pnlNumber === 0
          ? ""
          : "orderly-text-trade-loss"
      )}
      fixClassName="desktop:orderly-text-3xs"
      containerClassName={"desktop:orderly-bg-base-700 orderly-bg-base-500"}
      data-testid={props.testId}
      name={props.type}
      id={props.type}
      autoComplete={"off"}
      thousandSeparator
      suffix={
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={
                "orderly-px-2 orderly-h-full orderly-group active:orderly-outline-0"
              }
              data-testid={`${props.type}_dropdown_btn`}
            >
              <ArrowIcon
                size={12}
                className={
                  "group-data-[state=open]:orderly-rotate-180 orderly-transition orderly-text-base-contrast-54"
                }
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={"end"} className={"orderly-w-[120px]"}>
            <DropdownMenuItem
              onSelect={() => setMode(PnLMode.PnL)}
              data-testid={`${PnLMode.PnL}_menu_item`}
            >
              {PnLMode.PnL}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setMode(PnLMode.OFFSET)}
              data-testid={`${PnLMode.OFFSET}_mneu_item`}
            >
              {PnLMode.OFFSET}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setMode(PnLMode.PERCENTAGE)}
              data-testid={`${PnLMode.PERCENTAGE}_menu_item`}
            >
              {PnLMode.PERCENTAGE}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      value={value}
      onValueChange={(value) => {
        console.log("value", value);
        if (mode === PnLMode.PERCENTAGE && value !== "") {
          percentageSuffix.current = value.endsWith(".") ? "." : "";
          value = new Decimal(value).div(100).todp(4, 4).toNumber();
        }
        props.onChange(key, value);
        // setInnerValue(value);
      }}
    />
  );
};

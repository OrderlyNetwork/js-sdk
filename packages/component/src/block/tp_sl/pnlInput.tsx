import { Input } from "@/input";
import { FC, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { ArrowIcon } from "@/icon";
import { useLocalStorage } from "@orderly.network/hooks";
import { cn } from "@/utils";
import { commify } from "@orderly.network/utils";

interface Props {
  type: "TP" | "SL";
  quote: string;
  quote_db?: number;
  onChange: (key: string, value: number | string) => void;
  testId?: string;
  values: {
    PNL: string;
    Offset: string;
    "Offset%": string;
  };
}

export enum PnLMode {
  PNL = "PNL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export const PnlInput: FC<Props> = (props) => {
  const { quote, type, quote_db = 2 } = props;
  const [mode, setMode] = useLocalStorage<PnLMode>(
    "TP/SL_Mode",
    PnLMode.PERCENTAGE
  );

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

    if (val === "") return val;

    if (mode === PnLMode.PNL || mode === PnLMode.OFFSET) {
      return commify(val);
    }

    if (mode === PnLMode.PERCENTAGE) {
      return (Number(val) * 100).toFixed();
    }

    return val;
  }, [props.values, mode]);

  return (
    <Input
      prefix={mode}
      placeholder={mode === PnLMode.PERCENTAGE ? "%" : quote}
      className={cn(
        "orderly-text-right orderly-text-sm orderly-caret-white",
        Number(props.values.PNL) > 0
          ? "orderly-text-trade-profit"
          : "orderly-text-trade-loss"
      )}
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
              onSelect={() => setMode(PnLMode.PNL)}
              data-testid={`${PnLMode.PNL}_menu_item`}
            >
              {PnLMode.PNL}
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
        if (mode === PnLMode.PERCENTAGE && value !== "") {
          value = Number(value) / 100;
        }
        props.onChange(key, value);
      }}
    />
  );
};

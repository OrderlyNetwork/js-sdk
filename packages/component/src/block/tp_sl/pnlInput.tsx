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

interface Props {
  type: "TP" | "SL";
  quote: string;
  onChange: (key: string, value: number | string) => void;
  testId?: string;
  // values: {
  //   pnl: string;
  //   offset: string;
  // };
}

export enum PnLMode {
  PNL = "PNL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export const PnlInput: FC<Props> = (props) => {
  const { quote, type } = props;
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
        return `tp_pnl`;
    }
  }, [mode]);

  return (
    <Input
      prefix={mode}
      placeholder={mode === PnLMode.PERCENTAGE ? "%" : quote}
      className={"orderly-text-right orderly-pr-2"}
      data-testid={props.testId}
      name={props.type}
      id={props.type}
      suffix={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={"orderly-px-2 orderly-h-full orderly-group"}
              data-testid={`${props.type}_dropdown_btn`}
            >
              <ArrowIcon
                size={12}
                className={
                  "group-data-[state=open]:orderly-rotate-180 orderly-transition"
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
      onChange={(e) => {
        props.onChange(key, e.target.value);
      }}
    />
  );
};

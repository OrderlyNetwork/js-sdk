import { useMemo, useRef } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { InputFormatter, MenuItem } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export enum PnLMode {
  PnL = "PnL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export type BuilderProps = {
  type: "TP" | "SL";

  quote_dp?: number;
  onChange: (key: string, value: number | string) => void;
  // testId?: string;
  // values: {
  //   PnL: string;
  //   Offset: string;
  //   "Offset%": string;
  // };
};

export const usePNLInputBuilder = (props: BuilderProps) => {
  const { type } = props;
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

  const modes = useMemo<MenuItem[]>(() => {
    return [
      { label: "PnL", value: PnLMode.PnL, testId: `${PnLMode.PnL}_menu_item` },
      {
        label: "Offset",
        value: PnLMode.OFFSET,
        testId: `${PnLMode.OFFSET}_mneu_item`,
      },
      {
        label: "Offset%",
        value: PnLMode.PERCENTAGE,
        testId: `${PnLMode.PERCENTAGE}_menu_item`,
      },
    ];
  }, []);

  const percentageSuffix = useRef<string>("");

  const onValueChange = (value: string) => {
    // if (mode === PnLMode.PERCENTAGE) {
    //   if (value !== "") {
    //     percentageSuffix.current = value.endsWith(".") ? "." : "";
    //     value = new Decimal(value).div(100).todp(4, 4).toString();
    //   }
    // } else {
    //   // value = todpIfNeed(value, quote_dp);
    // }

    props.onChange(key, value);
  };

  const formatter = (options: {
    dp?: number;
    mode: PnLMode;
  }): InputFormatter => {
    const { dp = 2 } = options;
    return {
      onRenderBefore: (value: string | number) => {
        console.log(options);
        return value.toString();
      },
      onSendBefore: (value: string) => {
        console.log(options);
        return value;
      },
    };
  };

  return {
    mode,
    modes,
    formatter,
    onModeChange: (mode: PnLMode) => {
      setMode(mode);
    },
    onValueChange,
    quote_db: props.quote_dp,
  };
};

export type PNLInputState = ReturnType<typeof usePNLInputBuilder>;

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { MenuItem } from "@orderly.network/ui";
import { commify, Decimal, todpIfNeed } from "@orderly.network/utils";
import type {
  InputFormatter,
  InputFormatterOptions,
} from "@orderly.network/ui";
import { usePnlInputContext } from "./pnlInputContext";

export enum PnLMode {
  PnL = "PnL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export type PNL_Values = {
  PnL: string;
  Offset: string;
  "Offset%": string;
  ROI: string;
};

type PNL_Keys =
  | "tp_offset"
  | "tp_offset_percentage"
  | "tp_pnl"
  | "sl_offset"
  | "sl_offset_percentage"
  | "sl_pnl";

export type BuilderProps = {
  type: "TP" | "SL";

  quote_dp?: number;
  onChange: (key: PNL_Keys, value: number | string) => void;

  values: PNL_Values;
};

export const usePNLInputBuilder = (props: BuilderProps) => {
  const { type, values } = props;
  // const [mode, setMode] = useLocalStorage<PnLMode>(
  //   "TP/SL_Mode",
  //   PnLMode.PERCENTAGE
  // );
  const { mode, setMode, tipsEle } = usePnlInputContext();

  const [tipVisible, setTipVisible] = useState(false);

  const key = useMemo<PNL_Keys>(() => {
    switch (mode) {
      case PnLMode.OFFSET:
        return `${type.toLowerCase()}_offset` as PNL_Keys;
      case PnLMode.PERCENTAGE:
        return `${type.toLowerCase()}_offset_percentage` as PNL_Keys;
      default:
        return `${type.toLowerCase()}_pnl` as PNL_Keys;
    }
  }, [mode]);

  const value = useMemo(() => {
    // console.log("mode", mode, values);
    return values[mode as keyof PNL_Values];
  }, [values, mode]);

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
    props.onChange(key, value);
  };

  const onFocus = () => {
    // updateTips();
    setTipVisible(true);
  };

  /**
   * hide tips when input is blurred
   */
  const onBlur = () => {
    // setTips(undefined);
    setTipVisible(false);
  };

  const formatter = (options: {
    dp?: number;
    mode: PnLMode;
    type: "TP" | "SL";
  }): InputFormatter => {
    const { dp = 2 } = options;
    return {
      onRenderBefore: (
        value: string | number,
        options: InputFormatterOptions
      ) => {
        value = `${value}`; // convert to string

        if (type === "SL" && mode === PnLMode.PnL) {
          value = value.startsWith("-") ? value : "-" + value;
        }

        if (value === "" || value === "-") return "";
        // if (mode === PnLMode.PnL || mode === PnLMode.OFFSET) {
        //   return commify(value);
        // }

        if (mode === PnLMode.PERCENTAGE) {
          return `${new Decimal(value).mul(100).todp(2, 4).toString()}${
            percentageSuffix.current
          }`;
          // return (Number(value) * 100).toFixed(2);
        } else if (mode === PnLMode.OFFSET) {
          value = todpIfNeed(value, dp);
        } else {
          // value = new Decimal(value).todp(2).toString();
        }

        return `${value}`;
      },
      onSendBefore: (value: string) => {
        if (/^\-?0{2,}$/.test(value)) {
          return "0";
        }

        if (mode === PnLMode.PERCENTAGE) {
          if (value !== "") {
            percentageSuffix.current = value.endsWith(".") ? "." : "";
            value = new Decimal(value).div(100).todp(4, 4).toString();
          }
        } else {
          value = todpIfNeed(value, dp);
        }

        if (value === "" || value === "-") return "";

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
    onFocus,
    onBlur,
    value,
    onValueChange,
    quote_db: props.quote_dp,
    tips: tipVisible ? tipsEle : undefined,
  };
};

export type PNLInputState = ReturnType<typeof usePNLInputBuilder>;

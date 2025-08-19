import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { MenuItem } from "@orderly.network/ui";
import type {
  InputFormatter,
  InputFormatterOptions,
} from "@orderly.network/ui";
import { Decimal, todpIfNeed } from "@orderly.network/utils";
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
  const { type, values, quote_dp } = props;
  const { t } = useTranslation();
  const [focus, setFocus] = useState(true);
  // const [mode, setMode] = useLocalStorage<PnLMode>(
  //   "TP/SL_Mode",
  //   PnLMode.PERCENTAGE
  // );
  const { mode, setMode, tipsEle } = usePnlInputContext();

  const [tipVisible, setTipVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const [innerValue, setInnerValue] = useState<string>(
    values[mode as keyof PNL_Values],
  );

  // const value = useMemo(() => {
  //   // console.log("mode", mode, values);
  //   const value = values[mode as keyof PNL_Values];
  //   // if (isFocused) {
  //   //   return value;
  //   // }
  //   return value;
  // }, [values, mode, isFocused]);

  useEffect(() => {
    if (isFocused) {
      return;
    }
    setInnerValue(values[mode as keyof PNL_Values]);
  }, [values, mode, isFocused]);

  const modes = useMemo<MenuItem[]>(() => {
    return [
      {
        label: t("tpsl.pnl"),
        value: PnLMode.PnL,
        testId: `${PnLMode.PnL}_menu_item`,
      },
      {
        label: t("tpsl.offset"),
        value: PnLMode.OFFSET,
        testId: `${PnLMode.OFFSET}_mneu_item`,
      },
      {
        label: `${t("tpsl.offset")}%`,
        value: PnLMode.PERCENTAGE,
        testId: `${PnLMode.PERCENTAGE}_menu_item`,
      },
    ];
  }, [t]);

  const modeLabelMap = useMemo(() => {
    return {
      [PnLMode.PnL]: t("tpsl.pnl"),
      [PnLMode.OFFSET]: t("tpsl.offset"),
      [PnLMode.PERCENTAGE]: `${t("tpsl.offset")}%`,
    };
  }, [t]);

  const percentageSuffix = useRef<string>("");

  const onValueChange = (value: string) => {
    // console.log("onValueChange", value);
    // if (!isFocused) {
    //   props.onChange(key, value);
    // } else {
    //   setInnerValue(value);
    // }
    setInnerValue(value);
    props.onChange(key, value);
  };

  const onFocus = () => {
    // updateTips();
    setTipVisible(true);
    setIsFocused(true);
  };

  /**
   * hide tips when input is blurred
   */
  const onBlur = () => {
    // setTips(undefined);
    setTipVisible(false);
    setIsFocused(false);
    props.onChange(key, innerValue);
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
        options: InputFormatterOptions,
      ) => {
        value = `${value}`; // convert to string

        if (focus) {
          if (type === "SL" && mode === PnLMode.PnL) {
            value = value.startsWith("-") ? value : "-" + value;
          }
        }

        if (value === "" || value === "-") return "";
        // if (mode === PnLMode.PnL || mode === PnLMode.OFFSET) {
        //   return commify(value);
        // }

        if (mode === PnLMode.PERCENTAGE) {
          // value = new Decimal(
          //   value.replace(
          //     new RegExp(percentageSuffix.current.replace(".", "\\.") + "$"),
          //     ""
          //   )
          // )
          //   .mul(100)
          //   .toString();

          // return `${todpIfNeed(value, 2)}${percentageSuffix.current}`;
          return `${new Decimal(
            value.replace(
              new RegExp(percentageSuffix.current.replace(".", "\\.") + "$"),
              "",
            ),
          )
            .mul(100)
            .todp(2, 4)
            .toString()}${percentageSuffix.current}`;
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

        // console.log("onSendBefore", value);

        if (mode === PnLMode.PERCENTAGE) {
          if (value !== "") {
            // percentageSuffix.current = value.endsWith(".") ? "." : "";
            value = todpIfNeed(value, 2);
            const endStr = value.match(/\.0{0,2}$/);
            if (!!endStr) {
              percentageSuffix.current = endStr[0];
            } else {
              percentageSuffix.current = "";
            }
            value = new Decimal(value).div(100).toString();
            value = `${value}${percentageSuffix.current}`;
          }
        } else if (mode === PnLMode.PnL && type === "SL" && focus) {
          value = value.startsWith("-") ? value : "-" + value;
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
    modeLabelMap,
    formatter,
    onModeChange: (mode: PnLMode) => {
      setMode(mode);
    },
    onFocus,
    onBlur,
    value: innerValue,
    onValueChange,
    quote_dp,
    tips: tipVisible ? tipsEle : undefined,
    setFocus,
  };
};

export type PNLInputState = ReturnType<typeof usePNLInputBuilder>;

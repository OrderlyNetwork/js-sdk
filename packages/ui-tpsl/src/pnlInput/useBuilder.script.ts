import { useMemo, useRef } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { MenuItem } from "@orderly.network/ui";
import { Decimal, todpIfNeed } from "@orderly.network/utils";
import type {
  InputFormatter,
  InputFormatterOptions,
} from "@orderly.network/ui";

export enum PnLMode {
  PnL = "PnL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export type PNL_Values = {
  PnL: string;
  Offset: string;
  "Offset%": string;
};

export type BuilderProps = {
  type: "TP" | "SL";

  quote_dp?: number;
  onChange: (key: string, value: number | string) => void;

  values: PNL_Values;
};

export const usePNLInputBuilder = (props: BuilderProps) => {
  const { type, values } = props;
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
    return values[mode as keyof PNL_Values];
  }, [values]);

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
    console.log("onValueChange", value);
    props.onChange(key, value);
  };

  const formatter = (options: {
    dp?: number;
    mode: PnLMode;
  }): InputFormatter => {
    const { dp = 2 } = options;
    return {
      onRenderBefore: (
        value: string | number,
        options: InputFormatterOptions
      ) => {
        value = `${value}`; // convert to string

        // if (type === "SL" && mode === PnLMode.PnL) {
        //   value = value.startsWith("-") ? value : "-" + value;
        // }

        if (value === "" || value === "-") return "";
        // if (mode === PnLMode.PnL || mode === PnLMode.OFFSET) {
        //   return commify(value);
        // }

        if (mode === PnLMode.PERCENTAGE) {
          return `${new Decimal(
            value.replace(
              new RegExp(percentageSuffix.current.replace(".", "\\.") + "$"),
              ""
            )
          )
            .mul(100)
            .todp(2, 4)
            .toString()}${percentageSuffix.current}`;
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
          // console.log("value", value);
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
        } else {
          value = todpIfNeed(value, dp);
        }

        if (value === "" || value === "-") return "";

        return value;
      },
    };
    // return {
    //   onRenderBefore: (
    //     value: string | number,
    //     options: InputFormatterOptions
    //   ) => {
    //     // console.log("???", options);
    //     const { isFocused } = options;
    //     value = `${value}`;
    //     if (value === "" || value === "-") return "";

    //     // if (type === "SL" && mode === PnLMode.PnL) {
    //     //   if (isFocused) {
    //     //     value = value.startsWith("-") ? value : "-" + value;
    //     //   }
    //     // }

    //     if (mode === PnLMode.PERCENTAGE) {
    //       return `${todpIfNeed(new Decimal(value).mul(100).toString(), 2)}${
    //         percentageSuffix.current
    //       }`;
    //       // return (Number(value) * 100).toFixed(2);
    //     } else if (mode === PnLMode.OFFSET) {
    //       value = todpIfNeed(value, 2);
    //     } else {
    //       // value = new Decimal(value).todp(2).toString();
    //     }

    //     return value;
    //   },
    //   onSendBefore: (value: string, options: InputFormatterOptions) => {
    //     const { isFocused } = options;

    //     if (mode === PnLMode.PERCENTAGE) {
    //       if (value !== "") {
    //         percentageSuffix.current = value.endsWith(".") ? "." : "";
    //         value = new Decimal(value).div(100).toString();
    //         value = todpIfNeed(value, 4);
    //       }
    //     } else {
    //       // value = todpIfNeed(value, quote_dp);
    //       if (isFocused) {
    //         if (type === "SL" && mode === PnLMode.PnL) {
    //           // if (
    //           //   typeof values[PnLMode.PnL] !== "undefined" &&
    //           //   values[PnLMode.PnL] !== ""
    //           // )
    //           //   return value;
    //           const num = Number(value);
    //           if (!isNaN(num) && num !== 0) {
    //             value = (Math.abs(num) * -1).toString();
    //           } else {
    //             value = "";
    //           }
    //         }
    //       }
    //     }

    //     return value;
    //   },
    // };
  };

  return {
    mode,
    modes,
    type: props.type,
    formatter,
    onModeChange: (mode: PnLMode) => {
      setMode(mode);
    },
    value,
    pnl: values[PnLMode.PnL],
    onValueChange,
    quote_dp: props.quote_dp,
  };
};

export type PNLInputState = ReturnType<typeof usePNLInputBuilder>;

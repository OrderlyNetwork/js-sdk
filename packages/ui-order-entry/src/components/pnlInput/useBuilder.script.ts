import { useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { inputFormatter, MenuItem } from "@orderly.network/ui";
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
  OFFSET_FROM_MARK = "OffsetFromMark",
  PERCENTAGE_FROM_MARK = "PercentageFromMark",
}

export type PNL_Values = {
  PnL: string;
  Offset: string;
  "Offset%": string;
  OffsetFromMark: string;
  PercentageFromMark: string;
  ROI: string;
};

type PNL_Keys =
  | "tp_offset"
  | "tp_offset_percentage"
  | "tp_offset_from_mark"
  | "tp_offset_percentage_from_mark"
  | "tp_pnl"
  | "sl_offset"
  | "sl_offset_percentage"
  | "sl_offset_from_mark"
  | "sl_offset_percentage_from_mark"
  | "sl_pnl";

/**
 * SL PnL is stored as a signed loss (negative) for `pnlToPrice`; users may type the magnitude
 * without `-`. The formatter still prefixes `-` on display while focused so the field reads as
 * a loss without requiring the user to type a minus.
 *
 * @param raw Raw input string (may include commas or a trailing decimal point while typing)
 * @returns String safe to pass to `onChange` for `sl_pnl`
 */
function normalizeSlPnlForStore(raw: string): string {
  const v = `${raw}`.replace(/,/g, "").trim();
  if (v === "" || v === "-") return v;
  const withoutTrailingDot = v.replace(/\.$/, "");
  const num = Number(withoutTrailingDot);
  if (!isNaN(num) && num === 0) return "0";
  if (v.startsWith("-")) return v;
  return `-${v}`;
}

export type BuilderProps = {
  type: "TP" | "SL";

  quote_dp?: number;
  onChange: (key: PNL_Keys, value: number | string) => void;

  values: PNL_Values;
};

export const usePNLInputBuilder = (props: BuilderProps) => {
  const { type, values, quote_dp } = props;
  const { t } = useTranslation();
  /** `PNLInput` calls `setFocus(true)` on focus; state is unused but keeps the prop contract. */
  const [, setFocus] = useState(true);
  // const [mode, setMode] = useLocalStorage<PnLMode>(
  //   "TP/SL_Mode",
  //   PnLMode.PERCENTAGE
  // );
  const { mode, setMode, tipsEle } = usePnlInputContext();

  const [tipVisible, setTipVisible] = useState(false);
  const [draft, setDraft] = useState<{ key: PNL_Keys; value: string }>();

  const key = useMemo<PNL_Keys>(() => {
    switch (mode) {
      case PnLMode.OFFSET:
        return `${type.toLowerCase()}_offset` as PNL_Keys;
      case PnLMode.PERCENTAGE:
        return `${type.toLowerCase()}_offset_percentage` as PNL_Keys;
      case PnLMode.OFFSET_FROM_MARK:
        return `${type.toLowerCase()}_offset_from_mark` as PNL_Keys;
      case PnLMode.PERCENTAGE_FROM_MARK:
        return `${type.toLowerCase()}_offset_percentage_from_mark` as PNL_Keys;
      default:
        return `${type.toLowerCase()}_pnl` as PNL_Keys;
    }
  }, [mode, type]);

  const value = draft?.key === key ? draft.value : values[mode];

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
        label: t("tpsl.offsetPercent"),
        value: PnLMode.PERCENTAGE,
        testId: `${PnLMode.PERCENTAGE}_menu_item`,
      },
      {
        // @ts-ignore
        label: t("tpsl.offsetMark"),
        value: PnLMode.OFFSET_FROM_MARK,
        testId: `${PnLMode.OFFSET_FROM_MARK}_menu_item`,
      },
      {
        // @ts-ignore
        label: t("tpsl.offsetPercentMark"),
        value: PnLMode.PERCENTAGE_FROM_MARK,
        testId: `${PnLMode.PERCENTAGE_FROM_MARK}_menu_item`,
      },
    ];
  }, [t]);

  const modeLabelMap = useMemo(() => {
    return {
      [PnLMode.PnL]: t("tpsl.pnl"),
      [PnLMode.OFFSET]: t("tpsl.offsetHolder"),
      [PnLMode.PERCENTAGE]: `${t("tpsl.offsetHolder")}`,
      // Extend locale keys; not yet in LocaleMessages typings

      [PnLMode.OFFSET_FROM_MARK]: t("tpsl.offsetHolder"),
      [PnLMode.PERCENTAGE_FROM_MARK]: t("tpsl.offsetHolder"),
    };
  }, [t]);

  const percentageSuffix = useRef<string>("");

  const onValueChange = (value: string) => {
    setDraft({ key, value });
    if (value === "-") return;
    const outgoing = key === "sl_pnl" ? normalizeSlPnlForStore(value) : value;
    props.onChange(key, outgoing);
  };

  const onFocus = () => {
    setTipVisible(true);
  };

  /**
   * hide tips when input is blurred
   */
  const onBlur = () => {
    setTipVisible(false);
    setDraft(undefined);
    percentageSuffix.current = "";
  };

  const formatter = (options: {
    dp?: number;
    mode: PnLMode;
    type: "TP" | "SL";
  }): InputFormatter => {
    const dp = mode === PnLMode.PnL ? 2 : (options.dp ?? 2);
    return {
      onRenderBefore: (
        value: string | number,
        options: InputFormatterOptions,
      ) => {
        value = `${value}`; // convert to string

        // SL loss is shown with a leading minus even when the user only types the magnitude (no
        // reliance on `focus` so blur / controlled sync still reads as a loss).
        if (type === "SL" && mode === PnLMode.PnL) {
          value = value.startsWith("-") ? value : "-" + value;
        }

        if (value === "" || value === "-") {
          return mode === PnLMode.PnL ? "" : value;
        }
        // if (mode === PnLMode.PnL || mode === PnLMode.OFFSET) {
        //   return commify(value);
        // }

        if (
          mode === PnLMode.PERCENTAGE ||
          mode === PnLMode.PERCENTAGE_FROM_MARK
        ) {
          // // Order/API store offset% as a fraction (e.g. 0.1111); UI shows percent ×100 (11.11).
          let normalized = value
            .replace(
              new RegExp(percentageSuffix.current.replace(".", "\\.") + "$"),
              "",
            )
            .replace(/,/g, "");
          // Incomplete decimals like "0.01." are invalid for Decimal; strip a lone trailing dot.
          normalized = normalized.replace(/\.$/, "");
          if (
            isNaN(Number(normalized)) ||
            normalized === "" ||
            normalized === "-"
          ) {
            return value;
          }
          const sign = normalized.startsWith("-") ? "-" : "";
          return `${sign}${new Decimal(normalized).abs().mul(100).todp(2, 4).toString()}${percentageSuffix.current}`;
        } else if (
          mode === PnLMode.OFFSET ||
          mode === PnLMode.OFFSET_FROM_MARK
        ) {
          const decimalValue =
            /e/i.test(value) && Number.isFinite(Number(value))
              ? new Decimal(value).toFixed()
              : value;
          value = todpIfNeed(decimalValue, dp);
        } else {
          // value = new Decimal(value).todp(2).toString();
        }

        return `${value}`;
      },
      onSendBefore: (value: string, options: InputFormatterOptions) => {
        const negativeOffset = mode !== PnLMode.PnL && value.startsWith("-");
        value = inputFormatter.numberFormatter.onSendBefore(
          negativeOffset ? value.slice(1) : value,
          options,
        );
        if (negativeOffset) {
          value = `-${value}`;
          if (value === "-") {
            percentageSuffix.current = "";
            return value;
          }
        }
        if (/^\-?0{2,}$/.test(value)) {
          return "0";
        }

        if (
          mode === PnLMode.PERCENTAGE ||
          mode === PnLMode.PERCENTAGE_FROM_MARK
        ) {
          if (value !== "") {
            value = todpIfNeed(value, 2);
            const endStr = value.match(/\.0{0,2}$/);
            if (!!endStr) {
              percentageSuffix.current = endStr[0];
            } else {
              percentageSuffix.current = "";
            }
            if (isNaN(Number(value))) {
              return value;
            }
            const sign = negativeOffset ? "-" : "";
            value = `${sign}${new Decimal(value).abs().div(100).toString()}${percentageSuffix.current}`;
          }
        } else {
          value = todpIfNeed(value, dp);
          if (mode === PnLMode.PnL && type === "SL" && !value.startsWith("-")) {
            value = `-${value}`;
          }
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
      setDraft(undefined);
      percentageSuffix.current = "";
      setMode(mode);
    },
    onFocus,
    onBlur,
    value,
    onValueChange,
    quote_dp,
    tips: tipVisible ? tipsEle : undefined,
    setFocus,
  };
};

export type PNLInputState = ReturnType<typeof usePNLInputBuilder>;

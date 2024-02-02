import {
  Decimal,
  commify,
  getPrecisionByNumber,
  numberToHumanStyle,
} from "@orderly.network/utils";

export const parseNumber = (
  value: number | string,
  options: {
    rule?: "percentages" | "price" | "human";
    precision?: number;

    tick?: number;
    truncate?: "ceil" | "floor" | "round";
    padding?: boolean;

    abs?: boolean;
  } = {}
): string => {
  let { rule, precision, tick, truncate, padding, abs } = options;

  if (Number.isNaN(value)) {
    return "--";
  }

  const dp =
    typeof precision !== "undefined"
      ? precision
      : tick
      ? getPrecisionByNumber(tick)
      : 2;

  if (rule === "human") {
    return numberToHumanStyle(
      typeof value === "number" ? value : Number(value),
      dp
    );
  }

  let d = new Decimal(value);
  if (abs) {
    d = d.abs();
  }
  if (rule === "percentages") {
    return `${d.mul(100).toFixed(2)}%`;
  }

  let truncatedNum;

  if (truncate === "round") {
    if (padding) {
      truncatedNum = d.toFixed(dp, Decimal.ROUND_HALF_EVEN);
    } else {
      truncatedNum = d.todp(dp, Decimal.ROUND_HALF_EVEN).toString();
    }
  } else {
    if (padding) {
      truncatedNum = d.toFixed(dp);
    } else {
      truncatedNum = d.todp(dp).toString();
    }
  }

  if (rule === "price") {
    return commify(truncatedNum);
  }

  if (truncatedNum?.includes("e")) {
    // If dp is omitted, the return value will be unrounded and in normal notation.
    // https://mikemcl.github.io/decimal.js/#toFixed
    return new Decimal(truncatedNum)?.toFixed();
  }

  return truncatedNum;
};

export const NumberReg = /^([0-9]{1,}[.]?[0-9]*)/;

import Decimal from "decimal.js-light";

Decimal.set({
  rounding: Decimal.ROUND_DOWN,
});

export default Decimal;

export const cutNumber = (num: number | string, lenght: number) => {};

export const zero = new Decimal(0);

/** if num is undefined, returns options?.fallback || '-', otherwise it formats */
export const commifyOptional = (
  num?: number | string,
  options?: {
    fix?: number;
    fallback?: string;
    padEnd?: boolean;
    /// default is '0'
    fillString?: string;
    prefix?: string;
  },
): string => {
  // if num convert to num failed, return fallback
  if (typeof num === "string" && isNaN(Number(num))) {
    return options?.fallback || "--";
  }

  const prefix = options?.prefix || "";
  if (typeof num === "undefined") {
    return prefix + (options?.fallback || "--");
  }
  const value = commify(num, options?.fix);

  if (options && options.padEnd && options.fix) {
    const fillString = options?.fillString || "0";
    const hasDecimal = value.includes(".");
    const list = value.split(".");
    if (hasDecimal) {
      return prefix + list[0] + "." + list[1].padEnd(options.fix, fillString);
    }
    return prefix + list[0] + "." + "".padEnd(options.fix, fillString);
  }
  return prefix + value;
};

export const commify = (num: number | string, fix?: number): string => {
  const str = `${num}`;
  const parts = str.split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;

  const endsWithPoint = str.endsWith(".") && str.length > 1;
  const result =
    numberPart.replace(thousands, ",") +
    (decimalPart
      ? "." + decimalPart.substring(0, fix || decimalPart.length)
      : endsWithPoint
        ? "."
        : "");

  if (fix === 0 && result.includes(".")) {
    return result.substring(0, result.indexOf("."));
  }
  return result;
};

export const toNonExponential = (num: number) => {
  const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  if (!Array.isArray(m)) {
    return num;
  }
  return num.toFixed(
    Math.max(0, (m[1] || "").length - (m[2] as unknown as number)),
  );
};

export const getPrecisionByNumber = (num: number | string) => {
  num = toNonExponential(Number(num));
  const parts = num.toString().split(".");
  return parts[1] ? parts[1].length : 0;
};

/**
 *
 * @example
 * const number1 = 12345;
 * const number2 = 987654321;
 */
export function numberToHumanStyle(
  number: number,
  decimalPlaces: number = 2,
  options?: {
    padding?: boolean;
  },
): string {
  const { padding } = options || {};
  const abbreviations = ["", "K", "M", "B", "T"];

  let index = 0;
  while (number >= 1000 && index < abbreviations.length - 1) {
    number /= 1000;
    index++;
  }

  // const roundedNumber = number.toFixed(decimalPlaces);
  let roundedNumber = new Decimal(number)
    .toFixed(decimalPlaces, Decimal.ROUND_DOWN)
    .toString();

  // const roundedNumber = padding
  //   ? number.toFixed(decimalPlaces)
  //   : number.toString();

  roundedNumber = roundedNumber.replace(/\.0+$/, "");

  return `${roundedNumber}${abbreviations[index]}`;
}

// export function numberToHumanStyle(num: number, dp: number = 0): string {
//   const absNum = Math.abs(num);
//   let formattedNum = "";

//   let exp;

//   if (absNum >= 1e12) {
//     formattedNum = (num / 1e12).toFixed(dp) + "T";
//   } else if (absNum >= 1e9) {
//     formattedNum = (num / 1e9).toFixed(dp) + "B";
//   } else if (absNum >= 1e6) {
//     formattedNum = (num / 1e6).toFixed(dp) + "M";
//   } else if (absNum >= 1e3) {
//     formattedNum = (num / 1e3).toFixed(dp) + "K";
//   } else {
//     formattedNum = num.toString();
//   }

//   formattedNum = formattedNum.replace(/\.0$/, "");

//   return formattedNum;
// }

export function parseNumStr(str: string | number): Decimal | undefined {
  const value = str.toString();
  const cleanedStr = value.replace(/,/g, ""); // remove `,` char
  const numberPart = new Decimal(cleanedStr);
  const unitPart = cleanedStr.slice(-1);

  if (isNaN(numberPart.toNumber())) {
    return undefined; // invalid data
  }

  let result;

  switch (unitPart) {
    case "k":
    case "K":
      result = numberPart.mul(1000);
      break;
    case "m":
    case "M":
      result = numberPart.mul(1000000);
      break;
    case "b":
    case "B":
      result = numberPart.mul(1000000000);
      break;
    case "t":
    case "T":
      result = numberPart.mul(1000000000000);
      break;
    default:
      result = numberPart;
  }

  return result;
}

const scientificNotationPattern = /^[-+]?[0-9]+(\.[0-9]+)?[eE][-+]?[0-9]+$/;

//** remove trailing zeros 0.00000100 => 0.000001, 1 => 1 */
export function removeTrailingZeros(value: number, fixedCount: number = 16) {
  const text = `${value}`;
  const isScientific = scientificNotationPattern.test(text);
  if (!value.toString().includes(".") && !isScientific) {
    return `${value}`;
  }
  const formattedNumber = new Decimal(value)
    .toFixed(fixedCount)
    .replace(/(\.[0-9]*[1-9])0+$/, "$1");
  return formattedNumber;
}

export const todpIfNeed = (value: string | number, dp: number) => {
  if (value === undefined || value === "") {
    return value;
  }

  if (typeof value === "number") {
    value = value.toString();
  }

  if (value.endsWith(".")) {
    return value;
  }

  const numbers = value.split(".");

  if (numbers.length === 1) {
    return value;
  }

  if (numbers[1].length <= dp || !numbers[1]) {
    return value;
  }

  return `${numbers[0]}.${numbers[1].substring(0, dp)}`;
};

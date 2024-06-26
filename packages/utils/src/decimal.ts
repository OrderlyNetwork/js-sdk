import Decimal from "decimal.js-light";

Decimal.set({
  rounding: Decimal.ROUND_DOWN,
});

export default Decimal;

export const cutNumber = (num: number | string, lenght: number) => {};

export const zero = new Decimal(0);

export const commify = (num: number | string, fix?: number): string => {
  var parts = num.toString().split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;

  const endsWithPoint =
    num.toString().endsWith(".") && num.toString().length > 1;
  return (
    numberPart.replace(thousands, ",") +
    (decimalPart
      ? "." + decimalPart.substring(0, fix || decimalPart.length)
      : endsWithPoint
      ? "."
      : "")
  );
};

export const getPrecisionByNumber = (num: number | string): number => {
  // if(Math.floor(num) === num) return 0;
  num = toNonExponential(Number(num));
  const parts = num.toString().split(".");
  return parts[1] ? parts[1].length : 0;
};

export function toNonExponential(num: number) {
  const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  if (!Array.isArray(m)) return num;
  return num.toFixed(
    Math.max(0, (m[1] || "").length - (m[2] as unknown as number))
  );
}

/**
 *
 * @example
 * const number1 = 12345;
 * const number2 = 987654321;
 */
export function numberToHumanStyle(
  number: number,
  decimalPlaces: number = 2
): string {
  const abbreviations = ["", "K", "M", "B", "T"];

  let index = 0;
  while (number >= 1000 && index < abbreviations.length - 1) {
    number /= 1000;
    index++;
  }

  const roundedNumber = number.toFixed(decimalPlaces);

  return `${roundedNumber}${abbreviations[index]}`;
}

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

//** remove trailing zeros 0.00000100 => 0.000001, 1 => 1 */
export function removeTrailingZeros(
  value: number,
  fixedCount: number = 16
): string {
  const text = `${value}`;
  let scientificNotationPattern = /^[-+]?[0-9]+(\.[0-9]+)?[eE][-+]?[0-9]+$/;
  let isScientific = scientificNotationPattern.test(text);
  if (!value.toString().includes(".") && !isScientific) {
    return `${value}`;
  }
  let formattedNumber = new Decimal(value)
    .toFixed(fixedCount)
    .replace(/(\.[0-9]*[1-9])0+$/, "$1");
  return formattedNumber;
}

export const todpIfNeed = (value: string | number, dp: number) => {
  if (value === undefined || value === "") return value;

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

  // return value.substring(0, value.indexOf(".") + dp + 1);

  // return new Decimal(value).todp(dp, round).toNumber();
};

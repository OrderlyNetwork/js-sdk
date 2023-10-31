import Decimal from "decimal.js-light";

Decimal.set({
  rounding: Decimal.ROUND_DOWN,
});

export default Decimal;

export const cutNumber = (num: number | string, lenght: number) => {};

export const zero = new Decimal(0);

export const commify = (num: number | string): string => {
  var parts = num.toString().split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;
  return (
    numberPart.replace(thousands, ",") + (decimalPart ? "." + decimalPart : "")
  );
};

export const getPrecisionByNumber = (num: number | string): number => {
  // if(Math.floor(num) === num) return 0;
  const parts = num.toString().split(".");
  return parts[1] ? parts[1].length : 0;
};

/**
 *
 * @example
 * const number1 = 12345;
 * const number2 = 987654321;
 *
 *
 *
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

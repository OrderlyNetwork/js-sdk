import Decimal from "decimal.js-light";

Decimal.set({
  rounding: Decimal.ROUND_DOWN,
});

export default Decimal;

export const cutNumber = (num: number | string, lenght: number) => {};

export const commify = (num: number | string): string => {
  var parts = num.toString().split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;
  return (
    numberPart.replace(thousands, ",") + (decimalPart ? "." + decimalPart : "")
  );
};

export const getDecimalLength = (num: number | string): number => {
  // if(Math.floor(num) === num) return 0;
    const parts = num.toString().split(".");
    return parts[1] ? parts[1].length : 0;
}

export function numberToHumanStyle(number: number): string {
    const units = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];
    const delimiter = ',';

    if (number < 1000) {
        return number.toString();
    }

    const sign = Math.sign(number);
    const num = Math.abs(number);
    const exp = Math.floor(Math.log10(num) / 3);
    const rounded = Math.round(num / Math.pow(1000, exp) * 10) / 10;
    const formatted = rounded.toLocaleString();

    return (sign < 0 ? '-' : '') + formatted + ' ' + units[exp];
}
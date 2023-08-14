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

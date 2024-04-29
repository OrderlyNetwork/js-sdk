import { Decimal } from "@orderly.network/utils";

export const parseInputHelper = (input: string) => {
  if (input === undefined || input === "") return input;
  if (input.startsWith(".")) return `0${input}`;
  input = input.replace(/,/g, "");

  input = input
    .replace(/[^\d.]/g, "")
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".");

  return input;
};

export const todpIfNeed = (
  value: string | number,
  dp: number,
  round = Decimal.ROUND_DOWN
) => {
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

  return new Decimal(value).todp(dp, round).toNumber();
};

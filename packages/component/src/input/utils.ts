export const parseInputHelper = (input: string) => {
  if (input === undefined || input === "") return input;
  if (input.startsWith(".")) return `0.${input}`;
  input = input.replace(/,/g, "");

  input = input
    .replace(/[^\d.]/g, "")
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".");

  return input;
};

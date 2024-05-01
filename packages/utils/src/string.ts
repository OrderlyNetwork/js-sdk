export function capitalizeString(str: string): string {
  // Convert the string to lowercase
  const lowercaseStr: string = str.toLowerCase();
  // Capitalize the first letter
  const capitalizedStr: string =
    lowercaseStr.charAt(0).toUpperCase() + lowercaseStr.slice(1);
  return capitalizedStr;
}

/// "PERP_ETH_USDC" => "ETH_PERP"
export function transSymbolformString(input: string): string {
  const parts = input.split("_");
  if (parts.length !== 3) {
    throw new Error("Invalid string format");
  }

  const [first, second, third] = parts;

  if (!first.startsWith("PERP")) {
    throw new Error("Invalid string format");
  }

  const result = `${second}-${first}`;
  return result;
}

export function camelCaseToUnderscoreCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

export const findLongestCommonSubString = (str1: string, str2: string) => {
  // let index = 0;

  for (let index = 0; index < str1.length; index++) {
    const ele1 = str1.at(index);
    const ele2 = str2.at(index);
    if (ele1 === ele2) {
      continue;
    }

    return index;
  }

  return -1;
};

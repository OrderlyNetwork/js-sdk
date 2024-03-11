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

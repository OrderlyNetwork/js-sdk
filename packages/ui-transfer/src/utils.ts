export function formatAddress(address?: string) {
  if (!address) return "--";
  return address.replace(/^(.{6})(.*)(.{4})$/, "$1......$3");
}

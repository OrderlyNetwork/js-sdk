export const hex2int = (chainId: string): number => parseInt(chainId);
export const int2hex = (chainId: number): string => `0x${chainId.toString(16)}`;
export const praseChainId = (chainId: string | number): number => {
  if (typeof chainId === "string") return hex2int(chainId);
  return chainId;
};

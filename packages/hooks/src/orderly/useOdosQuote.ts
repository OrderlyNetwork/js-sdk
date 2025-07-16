import { useMutation } from "../useMutation";

// const requestbody = {
//   chainId: 1,
//   inputTokens: [
//     {
//       amount: "189000000",
//       tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
//     },
//   ],
//   outputTokens: [
//     {
//       proportion: 1,
//       tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//     },
//   ],
// };

export const useOdosQuote = () => {
  return useMutation(`https://api.odos.xyz/sor/quote/v2`);
};

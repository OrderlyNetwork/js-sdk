import { useMutation } from "../useMutation";

export const useOdosQuote = () => {
  return useMutation(`https://api.odos.xyz/sor/quote/v2`);
};

import { useQuery } from "../useQuery";

export interface Token {
  token: string;
  token_account_id: string;
  decimals: number;
  minimum_increment: number;
}

/**
 * useToken
 * @description get token info
 */
export const useToken = () => {
  return useQuery<Token[]>("/v1/public/token");
};

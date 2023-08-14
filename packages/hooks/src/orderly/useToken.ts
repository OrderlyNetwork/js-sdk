import { useQuery } from "../useQuery";

export interface Token {
  token:                   string;
  token_hash:              string;
  decimals:                number;
  minimum_withdraw_amount: number;
  chain_details:           ChainDetail[];
}

export interface ChainDetail {
  chain_id:         string;
  contract_address: string;
  decimals:         number;
}


export const useToken = () => {
  return useQuery<Token[]>("/public/token");
};

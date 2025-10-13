import { API } from "@kodiak-finance/orderly-types";

export type SubAccount = {
  id: string;
  description: string;
  holding: API.Holding[];
};

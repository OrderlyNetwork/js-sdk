import { API } from "@orderly.network/types";

export type SubAccount = {
  id: string;
  description: string;
  holding: API.Holding[];
};

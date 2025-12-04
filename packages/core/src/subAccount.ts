import { API } from "@veltodefi/types";

export type SubAccount = {
  id: string;
  description: string;
  holding: API.Holding[];
};

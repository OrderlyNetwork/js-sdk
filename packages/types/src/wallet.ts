import { API } from "./types/api";

export type Chain = {
  id: string;
  name?: string;
};

export type CurrentChain = {
  id: number;
  info: API.Chain;
};

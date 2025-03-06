import { useContext } from "react";
import { OrderlyContext } from "../orderlyContext";

export enum ENVType {
  prod = "prod",
  staging = "staging",
  qa = "qa",
  dev = "dev",
}

export const useGetEnv = (): ENVType => {
  const { configStore } = useContext(OrderlyContext);
  const baseUrl = configStore.get("apiBaseUrl") || "https://api.orderly.org";
  switch (baseUrl) {
    case "https://testnet-api.orderly.org":
      return ENVType.staging;
    case "https://dev-api.orderly.org":
      return ENVType.dev;
    case "https://qa-api.orderly.org":
      return ENVType.qa;
    default:
      return ENVType.prod;
  }
};

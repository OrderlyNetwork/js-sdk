import { ExchangeStatusEnum, SystemStateEnum } from "@orderly.network/types";

import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

// app system State , loading, dataError,netError,
// platform state
export const useAppState = () => {
  const { errors } = useContext(OrderlyContext);

  return {
    errors,
    // ready,
  };
};

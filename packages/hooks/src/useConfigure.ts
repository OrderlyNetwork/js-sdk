import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

export const useConfigure = () => {
  const { configStore } = useContext(OrderlyContext);

  return {
    get: configStore.get,
  };
};

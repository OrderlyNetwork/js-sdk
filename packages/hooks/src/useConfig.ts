import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

export const useConfig = () => {
  const { configStore } = useContext(OrderlyContext);

  //

  return configStore;
};

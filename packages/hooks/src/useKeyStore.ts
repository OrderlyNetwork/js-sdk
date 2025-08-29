import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

export const useKeyStore = () => {
  const ctx = useContext(OrderlyContext);

  return ctx.keyStore;
};

import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

export const useWebSocketClient = () => {
  const { ws } = useContext(OrderlyContext);

  return ws;
};

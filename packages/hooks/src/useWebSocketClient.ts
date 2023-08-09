import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

export const useWebSocketClient = () => {
  const {ws} = useContext(OrderlyContext);


  if (typeof ws === "undefined") {
    console.error("Orderly:: please add OrderlyProvider to your app");
  }

  return ws;
};

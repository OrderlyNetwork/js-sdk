import { useContext } from "react";
import { ConfigDataContext } from "./provider/config";

export const useConfig = () => {
  const { config } = useContext(ConfigDataContext);

  if (typeof config === "undefined") {
    throw new Error("useConfig must be used within a ConfigDataProvider");
  }

  return config;
};

import { useEffect } from "react";
import { useConfig } from "../useConfig";
import { ConfigStore } from "@orderly.network/core";

export const useSyncEnd = () => {
  const config = useConfig<ConfigStore>();
  useEffect(() => {
    fetch(`${config.get("apiBaseUrl")}/v1/public/system_info`, {
      //   method: "HEAD",
    }).then((res) => {});
  }, []);
};

import { useEffect } from "react";
import { useConfig } from "../useConfig";

export const useSyncEnd = () => {
  const config = useConfig();
  useEffect(() => {
    fetch(`${config.get("apiBaseUrl")}/v1/public/system_info`, {
      //   method: "HEAD",
    }).then((res) => {});
  }, []);
};

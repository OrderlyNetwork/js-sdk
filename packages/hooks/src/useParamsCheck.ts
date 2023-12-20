import { useEffect } from "react";

export const useParamsCheck = (params: { brokerId?: string }) => {
  useEffect(() => {
    if (!params.brokerId || params.brokerId === "orderly") {
      console.warn(
        "WARNING:" +
          "\n" +
          "========================" +
          "\n" +
          "[OrderlyConfigProvider]: please provide your brokerId" +
          "\n" +
          "========================"
      );
    }
  }, [params.brokerId]);
};

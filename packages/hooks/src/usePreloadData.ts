import { useMemo } from "react";
import { useQuery } from ".";

export const usePreLoadData = () => {
  const { error: tokenError, data: tokenData } = useQuery(
    "https://api-evm.orderly.org/v1/public/token",
    {
      revalidateOnFocus: false,
    }
  );

  const isDone = useMemo(() => {
    return !!tokenData;
  }, [tokenData]);

  return {
    error: tokenError,
    done: isDone,
  };
};

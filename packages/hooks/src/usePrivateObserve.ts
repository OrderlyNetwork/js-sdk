import { useEffect, useState } from "react";

export const usePrivateObserve = <T>() => {
  const [data, setData] = useState<T>();

  useEffect(() => {
    return () => {
      // unsubscribe
    };
  }, []);

  return {
    data,
  };
};

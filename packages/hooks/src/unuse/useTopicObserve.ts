import { useEffect, useState } from "react";

export const useTopicObserve = <T>(topic: string) => {
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

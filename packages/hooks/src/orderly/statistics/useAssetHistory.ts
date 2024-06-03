import { usePrivateInfiniteQuery } from "../../usePrivateInfiniteQuery";
import { useMemo } from "react";

const useAssetsHistory = (options: {
  token?: string;
  side?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}) => {
  const queryStr = useMemo(() => {
    return "";
  }, []);

  const getKey = () => {
    return `/v1/asset/history?${queryStr}`;
  };
  const { data, setSize, size } = usePrivateInfiniteQuery(getKey);

  return {
    data,
  } as const;
};

export { useAssetsHistory };

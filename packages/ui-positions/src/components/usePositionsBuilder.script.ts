import { usePositionStream } from "@orderly.network/hooks";

export const usePositionsBuilder = () => {
  const [data, info] = usePositionStream();
  return {
    dataSource: data?.rows ?? [],
  };
};

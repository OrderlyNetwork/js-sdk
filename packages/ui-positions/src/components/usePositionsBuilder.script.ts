import { usePositionStream } from "@orderly.network/hooks";

export const usePositionsBuilder = () => {
  const [data, info, { isLoading }] = usePositionStream();
  return {
    dataSource: data?.rows,
    isLoading,
  };
};

export type PositionsBuilderState = ReturnType<typeof usePositionsBuilder>;

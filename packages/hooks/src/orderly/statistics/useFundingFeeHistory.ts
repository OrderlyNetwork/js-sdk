import { usePrivateInfiniteQuery } from "../../usePrivateInfiniteQuery";

export const useFundingFeeHistory = () => {
  const getKey = () => {
    return `/v1/funding_fee/history`;
  };
  const { data, size, setSize, isLoading } = usePrivateInfiniteQuery<any>(
    getKey,
    {
      initialSize: 1,
      formatter: (data) => data,
      revalidateOnFocus: false,
    }
  );

  return [
    data?.map((d) => d.rows) || [],
    {
      meta: (data as any)?.[0]?.["meta"] || {},
    },
  ];
};

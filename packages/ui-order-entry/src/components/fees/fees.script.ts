import { useAccountInfo } from "@orderly.network/hooks";

export const useFeesScript = () => {
  const { data } = useAccountInfo();
  return {
    taker: data?.futures_taker_fee_rate ?? 0,
    maker: data?.futures_maker_fee_rate ?? 0,
  } as const;
};

import { useCallback, useEffect, useState } from "react";
import { usePrivateQuery } from "../usePrivateQuery";
import { useWebSocketClient } from "../useWebSocketClient";

export interface PositionReturn {
  data: any[];
  loading: boolean;
  close: (qty: number) => void;
}

export type Position = {
  symbol: string;
  position_qty: number;
  cost_position: number;
  last_sum_unitary_funding: number;
  pending_long_qty: number;
  pending_short_qty: number;
  settle_price: number;
  average_open_price: number;
  unsettled_pnl: number;
  mark_price: number;
  est_liq_price: number;
  timestamp: number;
  mmr: number;
  imr: number;
  IMR_withdraw_orders: number;
  MMR_with_orders: number;
  pnl_24_h: number;
  fee_24_h: number;
};

// [data,{loading,close}]
export const usePositionStream = () => {
  // const [data, setData] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hideOthers, setHideOthers] = useState<boolean>(false);

  const { data, error } = usePrivateQuery<{ rows: Position[] }>("/positions", {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const ws = useWebSocketClient();

  // console.log("positions", positions);

  const toggleHideOthers = useCallback(() => {
    setHideOthers((prev) => !prev);
  }, []);

  useEffect(() => {}, []);

  return [
    data?.rows || null,
    {
      close: (qty: number) => {},
      loading: false,
      hideOthers,
      error,
      loadMore: () => {},
      refresh: () => {},
      toggleHideOthers,
      // filter: (filter: string) => {},
    },
  ];
};

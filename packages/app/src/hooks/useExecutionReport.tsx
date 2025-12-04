/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import {
  useSymbolsInfo,
  useEventEmitter,
  useDebouncedCallback,
  useAudioPlayer,
  useLocalStorage,
  useOrderlyContext,
} from "@veltodefi/hooks";
import { OrderStatus } from "@veltodefi/types";
import { toast } from "@veltodefi/ui";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";

export const ORDERLY_ORDER_SOUND_ALERT_KEY = "orderly_order_sound_alert";

export const useExecutionReport = () => {
  const ee = useEventEmitter();

  const symbolsInfo = useSymbolsInfo();
  const symbolsInfoRef = useRef({});

  const { notification } = useOrderlyContext();

  useEffect(() => {
    symbolsInfoRef.current = symbolsInfo;
  }, [symbolsInfo]);

  const src = notification?.orderFilled?.media ?? "";

  const [soundAutoPlay] = useLocalStorage<boolean>(
    ORDERLY_ORDER_SOUND_ALERT_KEY,
    notification?.orderFilled?.defaultOpen ?? false,
  );

  const [audioElement] = useAudioPlayer(src, {
    autoPlay: soundAutoPlay,
    volume: 1,
  });

  const handler = useDebouncedCallback((data: any) => {
    const showToast = (data: any) => {
      const { title, msg, status } = getOrderExecutionReportMsg(
        data,
        symbolsInfoRef.current,
      );
      const isFilled =
        status === OrderStatus.FILLED || status === OrderStatus.PARTIAL_FILLED;
      // only show latest msg for same order type
      const orderType = data.algo_type || data.type;
      if (title && msg) {
        toast.success(
          <div>
            {title}
            <br />
            <div className="orderly-text-white/[0.54] orderly-text-xs">
              {msg}
            </div>
            {isFilled && audioElement}
          </div>,
          { id: orderType },
        );
      }
    };
    showToast(data);
  }, 100);

  useEffect(() => {
    ee.on("orders:changed", handler);
    return () => {
      ee.off("orders:changed", handler);
      handler.cancel();
    };
  }, [ee, handler]);
};

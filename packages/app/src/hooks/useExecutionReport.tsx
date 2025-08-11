/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import {
  useSymbolsInfo,
  useEventEmitter,
  useDebouncedCallback,
  useAudioPlayer,
  useLocalStorage,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";

const ORDERLY_SOUND_ALERT_KEY = "orderly_sound_alert";

export const useExecutionReport = () => {
  const ee = useEventEmitter();

  const symbolsInfo = useSymbolsInfo();
  const symbolsInfoRef = useRef({});

  const { notification } = useOrderlyContext();

  console.log("notification", notification);

  useEffect(() => {
    symbolsInfoRef.current = symbolsInfo;
  }, [symbolsInfo]);

  const src = notification?.orderFilled?.media ?? "";

  const [soundAutoPlay] = useLocalStorage<boolean>(
    ORDERLY_SOUND_ALERT_KEY,
    false,
  );

  const [element] = useAudioPlayer(src, {
    autoPlay: soundAutoPlay,
    volume: 1,
  });

  const handler = useDebouncedCallback((data: any) => {
    const showToast = (data: any) => {
      const { title, msg } = getOrderExecutionReportMsg(
        data,
        symbolsInfoRef.current,
      );
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
            {element}
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

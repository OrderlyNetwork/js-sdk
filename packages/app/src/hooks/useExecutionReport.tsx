/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import {
  useSymbolsInfo,
  useEventEmitter,
  useDebouncedCallback,
  useAudioPlayer,
} from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";

interface ExecutionReportProps {
  media?: string;
}

export const useExecutionReport = (options: ExecutionReportProps) => {
  const ee = useEventEmitter();

  const symbolsInfo = useSymbolsInfo();
  const symbolsInfoRef = useRef({});

  useEffect(() => {
    symbolsInfoRef.current = symbolsInfo;
  }, [symbolsInfo]);

  const src = options.media ?? "";

  const [element, audioRef] = useAudioPlayer(src, {
    autoPlay: true,
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
        audioRef.current?.play();
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

import { useEffect, useRef } from "react";
import { toast } from "@/toast";
import { getOrderExecutionReportMsg } from "@/block/orders/getOrderExecutionReportMsg";
import {
  useSymbolsInfo,
  useWS,
  useEventEmitter,
  useDebouncedCallback,
} from "@orderly.network/hooks";

export function useExecutionReport() {
  const ee = useEventEmitter();

  const symbolsInfo = useSymbolsInfo();
  const symbolsInfoRef = useRef({});

  useEffect(() => {
    symbolsInfoRef.current = symbolsInfo;
  }, [symbolsInfo]);

  const handler = useDebouncedCallback((data: any) => {
    const showToast = (data: any) => {
      const { title, msg } = getOrderExecutionReportMsg(
        data,
        symbolsInfoRef.current
      );

      if (title && msg) {
        toast.success(
          <div>
            {title}
            <br />
            <div className="orderly-text-white/[0.54] orderly-text-xs">
              {msg}
            </div>
          </div>
        );
      }
    };

    showToast(data);
  }, 100);

  useEffect(() => {
    ee.on("orders:changed", handler);

    return () => {
      ee.off("orders:changed", handler);
    };
  }, []);
}

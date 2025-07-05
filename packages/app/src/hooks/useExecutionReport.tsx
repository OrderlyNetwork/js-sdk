import { useEffect, useRef } from "react";
import {
  useSymbolsInfo,
  useEventEmitter,
  useDebouncedCallback,
} from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";

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
          </div>,
          {
            id: orderType,
          },
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

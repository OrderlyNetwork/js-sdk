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
import { OrderStatus } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";

export const ORDERLY_ORDER_SOUND_ALERT_KEY = "orderly_order_sound_alert";
export const ORDERLY_ORDER_SOUND_OPTION_KEY = "orderly_order_sound_option";

export const useExecutionReport = () => {
  const ee = useEventEmitter();

  const symbolsInfo = useSymbolsInfo();
  const symbolsInfoRef = useRef({});

  const { notification } = useOrderlyContext();

  useEffect(() => {
    symbolsInfoRef.current = symbolsInfo;
  }, [symbolsInfo]);

  const orderFilledConfig = notification?.orderFilled;
  const soundOptions = orderFilledConfig?.soundOptions;

  const defaultSoundValue =
    orderFilledConfig?.defaultSoundValue ?? soundOptions?.[0]?.value;

  const [selectedSoundValue] = useLocalStorage<string | null>(
    ORDERLY_ORDER_SOUND_OPTION_KEY,
    defaultSoundValue ?? null,
  );

  const selectedOption =
    soundOptions?.find((option) => option.value === selectedSoundValue) ??
    soundOptions?.[0];

  const src =
    (soundOptions && soundOptions.length ? selectedOption?.media : undefined) ??
    orderFilledConfig?.media ??
    "";

  const [soundAutoPlay] = useLocalStorage<boolean>(
    ORDERLY_ORDER_SOUND_ALERT_KEY,
    orderFilledConfig?.defaultOpen ?? false,
  );

  const { play: playOrderFilledSound } = useAudioPlayer(src, {
    enabled: soundAutoPlay,
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
      if (isFilled) {
        playOrderFilledSound();
      }
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

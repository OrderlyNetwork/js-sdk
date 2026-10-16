import { useEffect, useRef } from "react";
import {
  useSymbolsInfo,
  useEventEmitter,
  useAccount,
  useAudioPlayer,
  useLocalStorage,
  useOrderlyContext,
  useAllBrokers,
  formatSymbolWithBroker,
} from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";
import { getOrderExecutionReportMsg } from "./getOrderExecutionReportMsg";

export const ORDERLY_ORDER_SOUND_ALERT_KEY = "orderly_order_sound_alert";
export const ORDERLY_ORDER_SOUND_OPTION_KEY = "orderly_order_sound_option";

type ExecutionReport = Parameters<typeof getOrderExecutionReportMsg>[0];

const MAX_FILL_SOUND_ORDERS = 1000;

let anonymousOrderId = 0;

export const useExecutionReport = () => {
  const ee = useEventEmitter();
  const { state } = useAccount();
  const accountId = state.accountId;

  const symbolsInfo = useSymbolsInfo();
  const symbolsInfoRef = useRef({});

  const { notification } = useOrderlyContext();
  const [brokers] = useAllBrokers();
  const brokersRef = useRef<Record<string, string> | undefined>(undefined);

  useEffect(() => {
    symbolsInfoRef.current = symbolsInfo;
  }, [symbolsInfo]);

  useEffect(() => {
    brokersRef.current = brokers;
  }, [brokers]);

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

  const playOrderFilledSoundRef = useRef(playOrderFilledSound);
  useEffect(() => {
    playOrderFilledSoundRef.current = playOrderFilledSound;
  }, [playOrderFilledSound]);

  useEffect(() => {
    if (!accountId) return;

    const pending = new Map<string, ReturnType<typeof setTimeout>>();
    const playedFillQuantities = new Map<string, number>();
    const handler = (data: ExecutionReport) => {
      const isAlgoOrder = "algo_type" in data;
      const orderId = isAlgoOrder ? data.algo_order_id : data.order_id;
      // Anonymous reports must not overwrite each other or a known order.
      const identity =
        Number.isFinite(orderId) && orderId > 0
          ? orderId
          : `anonymous-${++anonymousOrderId}`;
      const id = `execution-report:${accountId}:${isAlgoOrder ? "algo" : "regular"}:${identity}`;
      const previous = pending.get(id);
      if (previous !== undefined) clearTimeout(previous);

      pending.set(
        id,
        setTimeout(() => {
          pending.delete(id);
          showToast(data, id);
        }, 100),
      );
    };
    const showToast = (data: ExecutionReport, id: string) => {
      const displaySymbol = formatSymbolWithBroker(
        data.symbol,
        symbolsInfoRef.current,
        brokersRef.current,
      );
      const { title, msg, hasFill } = getOrderExecutionReportMsg(
        data,
        symbolsInfoRef.current,
        displaySymbol,
      );
      const cumulativeFill = data.total_executed_quantity;
      const hasCumulativeFill =
        Number.isFinite(cumulativeFill) && cumulativeFill > 0;
      // Some algorithm roots report fills only on their children. Preserve
      // their sound when there is no usable root-level cumulative quantity.
      if (
        hasFill &&
        (!hasCumulativeFill ||
          cumulativeFill > (playedFillQuantities.get(id) ?? 0))
      ) {
        if (hasCumulativeFill) {
          playedFillQuantities.delete(id);
          playedFillQuantities.set(id, cumulativeFill);
          // Bound the per-account history during long trading sessions.
          if (playedFillQuantities.size > MAX_FILL_SOUND_ORDERS) {
            const oldest = playedFillQuantities.keys().next().value;
            if (oldest !== undefined) playedFillQuantities.delete(oldest);
          }
        }
        playOrderFilledSoundRef.current();
      }
      if (title && msg) {
        toast.success(
          <div>
            {title}
            <br />
            <div className="orderly-text-white/[0.54] orderly-text-xs">
              {msg}
            </div>
          </div>,
          { id },
        );
      }
    };

    ee.on("orders:changed", handler);
    return () => {
      ee.off("orders:changed", handler);
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
      playedFillQuantities.clear();
    };
  }, [ee, accountId]);
};

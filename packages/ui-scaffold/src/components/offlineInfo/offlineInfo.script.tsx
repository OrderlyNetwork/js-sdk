import { useCallback, useEffect, useRef, useState } from "react";

type Opts = {
  onStatusChange?: (was: boolean, is: boolean) => void;
  hideDelay?: number; // 网络恢复后延迟隐藏UI的时间（毫秒），默认 3000
};

export const useOfflineInfoScript = ({ opts }: { opts?: Opts }) => {
  // 1 init
  const [offline, setOffline] = useState<boolean | undefined>(undefined);
  const lastRef = useRef(offline);
  const cbRef = useRef(opts?.onStatusChange);
  cbRef.current = opts?.onStatusChange;

  // 管理探测状态和隐藏定时器
  const probingRef = useRef(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideDelayRef = useRef(opts?.hideDelay ?? 3000);

  // 更新 ref 值
  hideDelayRef.current = opts?.hideDelay ?? 3000;

  // 轻量级探活
  const probe = useCallback(async () => {
    try {
      await fetch("/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const update = (next: boolean) => {
      if (!alive || lastRef.current === next) return;
      cbRef.current?.(lastRef.current ?? false, next);
      lastRef.current = next;
      setOffline(next);
    };

    const onOffline = () => {
      // 离线时清除隐藏定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      update(true);
    };

    const onOnline = async () => {
      // 使用 ref 防止重复探测
      if (probingRef.current) return;
      try {
        probingRef.current = true;
        const ok = await probe();
        if (ok && alive) {
          // 只有从离线状态恢复到在线时才延迟隐藏
          const wasOffline = lastRef.current === true;

          if (wasOffline) {
            // 网络恢复成功，延迟隐藏UI，给用户时间手动刷新
            const delay = hideDelayRef.current;
            hideTimerRef.current = setTimeout(() => {
              update(false); // 确保UI隐藏
            }, delay);
          }
        } else {
          update(true);
        }
      } catch (e) {
        update(true);
      } finally {
        probingRef.current = false;
      }
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    if (navigator.onLine) {
      onOnline();
    } else {
      onOffline();
    }

    return () => {
      alive = false;
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      // 清除隐藏定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [probe]);

  return { offline };
};

export type OfflineInfoState = ReturnType<typeof useOfflineInfoScript>;

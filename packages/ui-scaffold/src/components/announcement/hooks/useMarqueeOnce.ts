import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Options {
  isActive: boolean; // 当前项是否正被展示
  pxPerSec?: number; // 滚动速度（像素/秒）
  startDelayMs?: number; // 开始前停顿
  endDelayMs?: number; // 结束后停顿
  fallbackStayMs?: number; // 不溢出时停留多久再切
  onFinish?: () => void; // 滚动（或停留）结束回调
}

export const useMarqueeOnce = (opts: Options) => {
  const {
    isActive,
    pxPerSec = 60,
    startDelayMs = 500,
    endDelayMs = 500,
    fallbackStayMs = 2500,
    onFinish,
  } = opts;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);

  const stopAll = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = null;
  };

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current?.forEach((id) => {
      if (id) {
        clearTimeout(id);
      }
    });
    timers.current = [];
  };

  const [overflow, setOverflow] = useState<boolean>(false);

  const [delta, setDelta] = useState<number>(0); // 需要水平滚动的距离（>0 表示需要左移这么多）

  useLayoutEffect(() => {
    const c = containerRef.current;
    const t = contentRef.current;
    if (!c || !t) {
      return;
    }

    const update = () => {
      const cw = c.clientWidth;
      const tw = t.scrollWidth;
      const need = Math.max(0, tw - cw);
      setOverflow(need > 0);
      setDelta(need);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(c);
    ro.observe(t);
    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    // 只有成为激活项时才跑动画 / 计时
    if (!isActive) {
      stopAll();
      clearTimers();
      // 复位 transform，避免下一次出现时位置不对
      if (contentRef.current) {
        contentRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      return;
    }

    const run = async () => {
      stopAll();
      clearTimers();

      if (!overflow || delta <= 0) {
        // 不溢出：停留 fallbackStayMs，结束回调
        const id = setTimeout(() => {
          onFinish?.();
        }, fallbackStayMs);
        timers.current.push(id);
        return;
      }

      // 溢出：先停顿，再按速度滚
      const startId = setTimeout(() => {
        const distance = delta; // 需要移动的像素
        const durationMs = (distance / pxPerSec) * 1000;

        const el = contentRef.current;
        if (!el) {
          return;
        }

        let startTs = 0;
        const startX = 0;
        const endX = -distance;

        const step = (ts: number) => {
          if (!startTs) {
            startTs = ts;
          }
          const progress = Math.min(1, (ts - startTs) / durationMs);
          const x = startX + (endX - startX) * progress;
          el.style.transform = `translate3d(${x}px, 0, 0)`;

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(step);
          } else {
            const endId = setTimeout(() => {
              onFinish?.();
            }, endDelayMs);
            timers.current.push(endId);
          }
        };

        rafRef.current = requestAnimationFrame(step);
      }, startDelayMs);

      timers.current.push(startId);
    };

    run();

    return () => {
      stopAll();
      clearTimers();
    };
  }, [
    isActive,
    overflow,
    delta,
    pxPerSec,
    startDelayMs,
    endDelayMs,
    fallbackStayMs,
    onFinish,
  ]);

  return { containerRef, contentRef, overflow, delta };
};

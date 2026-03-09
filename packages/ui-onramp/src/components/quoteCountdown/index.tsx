import { FC, useCallback, useRef, useSyncExternalStore } from "react";

const RADIUS = 6;
const TRACK_STROKE = 1.5;
const ARC_STROKE = 2;
const SIZE = (RADIUS + ARC_STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type QuoteCountdownProps = {
  duration?: number;
  isValidating?: boolean;
};

function createTickStore(duration: number) {
  let elapsed = 0;
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    stop();
    elapsed = 0;
    timer = setInterval(() => {
      elapsed += 1;
      if (elapsed >= duration) stop();
      listeners.forEach((l) => l());
    }, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  return {
    getSnapshot: () => elapsed,
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      if (listeners.size === 1) start();
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0) stop();
      };
    },
    reset: () => start(),
  };
}

const store = createTickStore(30);

export const QuoteCountdown: FC<QuoteCountdownProps> = ({
  duration = 30,
  isValidating = false,
}) => {
  const prevValidatingRef = useRef(isValidating);
  if (prevValidatingRef.current && !isValidating) {
    store.reset();
  }
  prevValidatingRef.current = isValidating;

  const subscribe = useCallback((cb: () => void) => store.subscribe(cb), []);
  const getSnapshot = useCallback(() => store.getSnapshot(), []);

  const elapsed = useSyncExternalStore(subscribe, getSnapshot);

  const prevElapsedRef = useRef(elapsed);
  const isResetting = elapsed < prevElapsedRef.current;
  prevElapsedRef.current = elapsed;

  const finished = elapsed >= duration;
  const progress = finished ? 1 : elapsed / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const transitionDuration = isResetting ? "0.6s" : "0.2s";

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="oui-shrink-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={TRACK_STROKE}
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgb(var(--oui-color-primary-light))"
        strokeWidth={ARC_STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        style={{
          transition: `stroke-dashoffset ${transitionDuration} ease-in-out`,
        }}
      />
    </svg>
  );
};

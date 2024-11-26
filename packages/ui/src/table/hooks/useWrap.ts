import { useEffect, useRef } from "react";

export function useWrap(deps: any[]) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;

    const bgColor = window.getComputedStyle(wrapRef.current).backgroundColor;

    wrapRef.current.style.setProperty("--oui-table-background-color", bgColor);
  }, deps);

  return wrapRef;
}

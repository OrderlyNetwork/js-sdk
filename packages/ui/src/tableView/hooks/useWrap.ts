import { useEffect, useRef } from "react";

export function useWrap() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;

    const bgColor = window.getComputedStyle(wrapRef.current).backgroundColor;

    wrapRef.current.style.setProperty("--oui-table-background-color", bgColor);
  }, []);

  return wrapRef;
}

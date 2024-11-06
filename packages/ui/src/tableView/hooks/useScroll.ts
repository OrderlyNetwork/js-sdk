import { useEffect, useRef, useState } from "react";

export function useScroll(deps: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    setShowRightShadow(hasHorizontalScroll(scrollRef.current));

    scrollRef.current.addEventListener("scroll", function (e) {
      setShowLeftShadow(scrollRef.current!.scrollLeft > 0);
      setShowRightShadow(!isScrolledToRight(scrollRef.current!));
    });
  }, [scrollRef]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    setShowRightShadow(hasHorizontalScroll(scrollRef.current));
  }, [scrollRef, ...deps]);

  return {
    scrollRef,
    showLeftShadow,
    showRightShadow,
  };
}

function isScrolledToRight(element: HTMLDivElement) {
  // console.log(element.scrollLeft, element.clientWidth, element.scrollWidth);
  return element.scrollLeft + element.clientWidth >= element.scrollWidth;
}

function hasHorizontalScroll(element: HTMLDivElement) {
  return element.scrollWidth > element.clientWidth;
}

function hasVerticalScroll(element: HTMLDivElement) {
  return element.scrollHeight > element.clientHeight;
}

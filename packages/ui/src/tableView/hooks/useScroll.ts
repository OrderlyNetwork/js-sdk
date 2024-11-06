import { useEffect, useRef, useState } from "react";

export function useScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.addEventListener("scroll", function (e) {
      setShowLeftShadow(scrollRef.current!.scrollLeft > 0);
      setShowRightShadow(!isScrolledToRight(scrollRef.current!));
    });
  }, [scrollRef]);

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

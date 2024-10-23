import { useEffect, useRef, useState } from "react";

function isScrolledToRight(element: HTMLDivElement) {
  console.log(element.scrollLeft, element.clientWidth, element.scrollWidth);
  return element.scrollLeft + element.clientWidth >= element.scrollWidth;
}

function hasHorizontalScroll(element: HTMLDivElement) {
  return element.scrollWidth > element.clientWidth;
}

function hasVerticalScroll(element: HTMLDivElement) {
  return element.scrollHeight > element.clientHeight;
}

export function useSyncScroll() {
  const [isXScroll, setIsXScroll] = useState(false);
  const [isYScroll, setIsYScroll] = useState(false);
  const theadRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theadRef.current && tbodyRef.current) {
      setIsXScroll(hasHorizontalScroll(tbodyRef.current));
      setIsYScroll(hasVerticalScroll(tbodyRef.current));

      tbodyRef.current.addEventListener("scroll", function (e) {
        // const isRight = isScrolledToRight(tbodyRef.current!);
        theadRef.current!.scrollTo({
          left: tbodyRef.current!.scrollLeft,
        });
      });
      theadRef.current.addEventListener("scroll", function (e) {
        tbodyRef.current!.scrollTo({ left: theadRef.current!.scrollLeft });
      });
    }
  }, []);

  return { theadRef, tbodyRef, isXScroll, isYScroll };
}

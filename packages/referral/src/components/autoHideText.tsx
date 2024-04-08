import { cn } from "@orderly.network/react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

export const AutoHideText: FC<{ text: string, className?: string, visibleCount?: number, }> = (props) => {

  const { text, visibleCount } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState<number | undefined>(undefined);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  function getTextWidth(ref: HTMLDivElement, text: string): number | undefined {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = getComputedStyle(ref).font;
      const width = context.measureText(text).width;
      return width;
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setContainerWidth(containerWidth);
      }


      if (textRef.current) {
        const width = getTextWidth(textRef.current, text);
        if (width) {
          setScrollWidth(width);
        }
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, [text]);

  // useEffect(() => {
  //   if (textRef.current) {

  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');
  //     if (context) {

  //       context.font = getComputedStyle(textRef.current).font;

  //       const width = context.measureText(text).width;
  //       setScrollWidth(width);

  //       console.log('Text width:', width, context.font);
  //     }
  //   }
  // }, [text]);


  const truncatedText = useMemo(() => {
    if (containerWidth && scrollWidth && scrollWidth > containerWidth) {
      const count = (text.match(/\//g) || []).length;
      const maxCharacters = visibleCount || Math.floor(containerWidth / scrollWidth * (text.length  - count - 5));
      const startText = text.slice(0, Math.ceil(maxCharacters / 2));
      const endText = text.slice(text.length - Math.floor(maxCharacters / 2), text.length);

      return (`${startText}...${endText}`);
    } else {
      return (text);
    }

  }, [scrollWidth, containerWidth, text, visibleCount]);

  return (
    <div ref={containerRef} className="orderly-relative">
      <div className={cn("orderly-hidden orderly-whitespace-nowrap orderly-overflow orderly-overflow-hidden-x orderly-absolute orderly-top-0 orderly-bottom-0 orderly-right-0 orderly-left-0", props.className)}>
        <div ref={textRef}>
          {`${text}...`}
        </div>
      </div>
      <div>{truncatedText}</div>
    </div>
  );
}
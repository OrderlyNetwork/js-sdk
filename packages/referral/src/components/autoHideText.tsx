import { cn } from "@orderly.network/react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

export const AutoHideText: FC<{ text: string, className?: string, visibleCount?: number, }> = (props) => {

  const { text, visibleCount } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lastContainerWidth = useRef<number | undefined>(undefined);

  function getTextWidth(ref: HTMLDivElement, text: string): number | undefined {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const element = document.getElementById("auto-hide-text-id-orderly");
    if (context && element) {
      let fontStyle = getComputedStyle(element).font;
      if (fontStyle.length === 0) {
        fontStyle = [
          getComputedStyle(element).fontWeight,
          getComputedStyle(element).fontSize,
          getComputedStyle(element).fontFamily,
        ].join(" ");
      }
      context.font = fontStyle;
      context.letterSpacing = getComputedStyle(element).letterSpacing;

      

      const width = context.measureText(text).width;
      return width;
    }
    return undefined;
  }


  const [visibleChars, setVisibleChars] = useState(0);


  useEffect(() => {
    const calculateVisibleChars = () => {

      if (containerRef.current && textRef.current) {

        const containerWidth = containerRef.current.clientWidth;

        if (containerWidth == lastContainerWidth.current) return;
        lastContainerWidth.current = containerWidth;


        const textElement = textRef.current;

        const textContent = text;

        const pWidth = Math.ceil(getTextWidth(textElement, "...") || 0);

        getComputedStyle(textElement)


        let start = 0;
        let end = textContent.length - 1;
        let mid;

        while (start <= end) {
          mid = Math.floor((start + end) / 2);
          const slicedText = textContent.slice(0, mid + 1);
          const measuredWidth = getTextWidth(textRef.current, slicedText);
          if (!measuredWidth) break;

          if (measuredWidth < (containerWidth - pWidth)) {
            start = mid + 1;
          } else {
            end = mid - 1;
          }
        }

        // console.log("end end end", end - 3, containerWidth,);

        setVisibleChars(end - 6);

      }

    };

    lastContainerWidth.current = undefined;
    calculateVisibleChars();

    window.addEventListener('resize', calculateVisibleChars);
    return () => {
      lastContainerWidth.current = undefined;
      window.removeEventListener('resize', calculateVisibleChars);
    };
  }, [text, textRef]);

  const truncatedText = useMemo(() => {

    if (visibleChars + 1 >= text.length) {
      return text;
    }

    const maxCharacters = visibleCount || visibleChars;

    const startText = text.slice(0, Math.ceil(maxCharacters / 2));
    const endText = text.slice(text.length - Math.floor(maxCharacters / 2), text.length);


    return (`${startText}...${endText}`);


  }, [text, visibleCount, visibleChars]);

  return (
    <div ref={containerRef} className="orderly-relative orderly-font-medium">
      <div className={cn("orderly-hidden orderly-whitespace-nowrap orderly-overflow orderly-overflow-hidden-x orderly-absolute orderly-top-0 orderly-bottom-0 orderly-right-0 orderly-left-0", props.className)}>
        <span ref={textRef}>
          {text}
        </span>
      </div>
      <div id="auto-hide-text-id-orderly">{truncatedText}</div>
    </div>
  );
}
import { cn } from "@orderly.network/react";
import { FC, useEffect, useMemo, useRef, useState } from "react";

export const AutoHideText: FC<{ text: string, className?: string }> = (props) => {

  const { text } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollWidth, setScrollWidth] = useState<number | undefined>(undefined);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.parentElement?.offsetWidth;
        setContainerWidth(containerWidth);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, [text]);
  
  useEffect(() => {
    if (textRef.current) {

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {

        context.font = getComputedStyle(textRef.current).font;
    
        const width = context.measureText(text).width;
        setScrollWidth(width);
    
        console.log('Text width:', width, context.font);
      }
    }
  }, [text]);


  const truncatedText = useMemo(() => {
    if (containerWidth && scrollWidth && scrollWidth > containerWidth) {      
      const count = (text.match(/\//g) || []).length;
      const maxCharacters = Math.floor(containerWidth / scrollWidth * text.length) - (count + 1);
    
      const startText = text.slice(0, Math.ceil(maxCharacters / 2));
      const endText = text.slice(text.length - Math.floor(maxCharacters / 2), text.length);

      return (`${startText}...${endText}`);
    } else {
      return (text);
    }

  }, [scrollWidth, containerWidth, text]);

  return (
    <div ref={containerRef} className="orderly-relative">
      <div className={cn("orderly-whitespace-nowrap orderly-overflow orderly-overflow-hidden-y orderly-absolute orderly-top-0 orderly-right-0 orderly-bottom-0 orderly-left-0", props.className)}>
        <span ref={textRef}>
          {truncatedText}
        </span>
      </div>
    </div>
  );
}
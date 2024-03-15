import { FC, useEffect, useRef, useState } from "react";

export const AutoHideText: FC<{text: string}> = (props) => {

    const {text} = props;
    const containerRef = useRef(null);

    const [truncatedText, setTruncatedText] = useState(text);

    useEffect(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = containerRef.current.scrollWidth;
  
        if (textWidth > containerWidth) {
          const middleIndex = Math.floor(text.length / 2);
          const visibleLength = Math.floor(containerWidth / 8); // 根据实际情况调整每个字符的平均宽度
  
          const startText = text.slice(0, middleIndex - Math.ceil(visibleLength / 2));
          const endText = text.slice(middleIndex + Math.floor(visibleLength / 2), text.length);
          setTruncatedText(`${startText}...${endText}`);
        } else {
          setTruncatedText(text);
        }
      }
    }, [text]);
  
    return (
      <div ref={containerRef} style={{ maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {truncatedText}
      </div>
    );
}
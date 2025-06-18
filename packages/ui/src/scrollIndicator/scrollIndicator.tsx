import { FC, ReactNode } from "react";
import { cnBase } from "tailwind-variants";
import { useDrag } from "./hooks/useDrag";
import { useScroll } from "./hooks/useScroll";
import { ScrolButton } from "./scrollButton";

export type ScrollIndicatorProps = { children: ReactNode; className?: string };

export const ScrollIndicator: FC<ScrollIndicatorProps> = (props) => {
  const { containerRef, leadingVisible, tailingVisible, onScoll } = useScroll();

  const { handleMouseDown, handleMouseMove, handleMouseUp, isDragging } =
    useDrag(containerRef);

  return (
    <div
      className={cnBase(
        "oui-scroll-indicator",
        "oui-relative oui-select-none oui-overflow-hidden",
        props.className,
      )}
    >
      <div
        ref={containerRef}
        className={cnBase(
          "oui-hide-scrollbar oui-overflow-x-scroll",
          isDragging ? "oui-cursor-grabbing" : "oui-cursor-grab",
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {props.children}
      </div>
      <ScrolButton leading onClick={onScoll} visible={leadingVisible} />
      <ScrolButton tailing onClick={onScoll} visible={tailingVisible} />
    </div>
  );
};

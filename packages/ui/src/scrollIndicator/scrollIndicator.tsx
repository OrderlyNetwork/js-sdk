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
        "oui-relative oui-overflow-hidden oui-select-none",
        props.className
      )}
    >
      <div
        ref={containerRef}
        className={cnBase(
          "oui-overflow-x-scroll oui-hide-scrollbar",
          isDragging ? "oui-cursor-grabbing" : "oui-cursor-grab"
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

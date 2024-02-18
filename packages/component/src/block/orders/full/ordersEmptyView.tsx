import { EmptyView } from "@/listView/emptyView";
import { FC, RefObject, useEffect, useRef, useState } from "react";

export const OrdersEmptyView: FC<{
  watchRef: RefObject<HTMLDivElement>;
  left: number;
  right: number;
}> = (props) => {
  const { watchRef, left, right } = props;

  const [xPosition, setXPosition] = useState({ left: 0, right: 0 });

  const calcPoistion = (left: number, right: number) => {
    const leftTargetElement = document.getElementById(
      "table_left_fixed_divide"
    );
    const rightTargetElement = document.getElementById(
      "table_right_fixed_divide"
    );

    let xLeft = left;
    let xRight = right;
    if (leftTargetElement && leftTargetElement?.parentElement) {
      const parentElement = leftTargetElement?.parentElement;

      const rect = leftTargetElement.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();

      const position = {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        width: rect.width,
        height: rect.height,
      };

      // console.log('left Div position:', position);
      xLeft = rect.width > 0 ? rect.left - parentRect.left : xLeft;
    }

    if (rightTargetElement && rightTargetElement?.parentElement) {
      const parentElement = rightTargetElement?.parentElement;

      const rect = rightTargetElement.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();

      const position = {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        width: rect.width,
        height: rect.height,
      };

      // console.log('right Div position:', position);
      xRight = right; //rect.width > 0 ? right : 0;
    }

    setXPosition({ left: xLeft, right: xRight });
  };

  useEffect(() => {
    calcPoistion(left, right);
  }, [left, right]);

  useEffect(() => {
    const divElement = watchRef.current;

    if (!divElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        calcPoistion(left, right);
      }
    });

    resizeObserver.observe(divElement);

    return () => {
      resizeObserver.unobserve(divElement);
    };
  }, [watchRef, left, right]);

  return (
    <div
      className="orderly-table-list-empty orderly-absolute orderly-left-0 orderly-right-0 orderly-top-[44px] orderly-bottom-0 orderly-bg-base-900"
      style={{
        left: `${xPosition.left}px`,
        right: `${xPosition.right}px`,
      }}
    >
      <EmptyView />
    </div>
  );
};

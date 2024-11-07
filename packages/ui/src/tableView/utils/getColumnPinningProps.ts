import { CSSProperties } from "react";
import { cnBase } from "tailwind-variants";
import { TanstackColumn } from "../type";

export function getColumnPinningProps(
  column: TanstackColumn<any>,
  isHeader?: boolean
) {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  const style: CSSProperties = {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    width: column.getSize(),
  };

  const contentCls = cnBase(
    isPinned ? "oui-sticky" : "oui-relative",
    isPinned ? "oui-z-[1]" : "oui-z-0",
    isPinned && "oui-bg-[var(--oui-table-background-color)]"
  );

  const shadowCls = cnBase(
    "before:oui-block before:oui-absolute",
    "before:oui-w-[32px] before:oui-h-full",
    "before:oui-top-0 before:oui-z-[-1]",
    "before:oui-bg-[linear-gradient(90deg,rgba(var(--oui-color-base-10)_/_0.80)_0%,rgba(var(--oui-color-base-10)_/_0.36)_65%,rgba(var(--oui-color-base-10)_/_0.00)_100%)]"
  );

  const leftShadow =
    isLastLeftPinnedColumn && cnBase(shadowCls, "before:oui-right-[-32px]");

  const rightShadow =
    isFirstRightPinnedColumn &&
    cnBase(shadowCls, "before:oui-left-[-32px] before:oui-rotate-180");

  return {
    style,
    classNames: {
      content: contentCls,
      leftShadow,
      rightShadow,
    },
  };
}

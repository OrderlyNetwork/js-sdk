import { FC, useRef, type PropsWithChildren } from "react";
import { useEndReached } from "./useEndReached";
import { cn } from "@/utils/css";

export interface EndReachedBoxProps {
  onEndReached?: () => void;
  // className?: string;
}

export const EndReachedBox: FC<PropsWithChildren<EndReachedBoxProps>> = (
  props
) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { onEndReached } = props;

  useEndReached(sentinelRef, () => {
    onEndReached?.();
  });

  return (
    <>
      {props.children}
      <div
        ref={sentinelRef}
        className="orderly-relative orderly-invisible orderly-h-[1px] orderly-bg-red-400"
      />
    </>
  );
};

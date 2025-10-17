import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useFloatingDialogPosition } from "../hooks/useFloatingDialogPosition";

export interface FloatingStarchildDialogProps {
  offset: number;
  children?:
    | React.ReactNode
    | ((props: {
        startDragging: (e: React.MouseEvent | React.TouchEvent) => void;
        dragging: boolean;
      }) => React.ReactNode);
  /** Diameter of the floating trigger (for aligning initial position). Defaults to 60. */
  triggerDiameter?: number;
  /** Optional storage key to distinguish different dialog instances */
  positionStorageKey?: string;
  /** Title for accessibility (screen readers). Can be visually hidden. */
  title?: string;
}

export const FloatingStarchildDialog: React.FC<
  FloatingStarchildDialogProps
> = ({
  offset,
  children,
  triggerDiameter,
  positionStorageKey,
  title = "Bind with Telegram",
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const { position: savedPosition, setPosition: persistPosition } =
    useFloatingDialogPosition(positionStorageKey);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    bottom: number;
    right: number;
  }>(() => {
    const baseBottom = 22;
    const baseRight = -10;
    return {
      top: 100,
      left: 100,
      bottom: baseBottom + offset,
      right: baseRight + offset,
    };
  });

  // Compute initial top/left based on desired corner and dialog size
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Base offsets for the floating ball (bottom-right)
    const baseBottom = 22;
    const baseRight = -10;
    const bottom = baseBottom + offset;
    const right = baseRight + offset;

    // Compute corresponding top/left
    const top = vh - rect.height - bottom;
    const left = vw - rect.width - right;

    setPos({ top, left, bottom, right });
  }, [offset, triggerDiameter]);

  // Apply saved position if available
  useEffect(() => {
    if (!savedPosition) return;
    const hasSaved =
      savedPosition.top !== 0 ||
      savedPosition.left !== 0 ||
      savedPosition.bottom !== 0 ||
      savedPosition.right !== 0;
    if (hasSaved) {
      setPos(savedPosition);
    }
  }, [savedPosition]);

  const clampToViewport = useCallback((top: number, left: number) => {
    const el = contentRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = el?.offsetWidth ?? 0;
    const h = el?.offsetHeight ?? 0;
    const nextTop = Math.max(0, Math.min(vh - h, top));
    const nextLeft = Math.max(0, Math.min(vw - w, left));
    return { top: nextTop, left: nextLeft };
  }, []);

  const handlePointerMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const clientX =
        (e instanceof TouchEvent
          ? e.touches[0]?.clientX
          : (e as MouseEvent).clientX) ?? 0;
      const clientY =
        (e instanceof TouchEvent
          ? e.touches[0]?.clientY
          : (e as MouseEvent).clientY) ?? 0;
      const { x, y } = offsetRef.current;
      const el = contentRef.current;
      const w = el?.offsetWidth ?? 0;
      const h = el?.offsetHeight ?? 0;
      const { top, left } = clampToViewport(clientY - y, clientX - x);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bottom = Math.max(0, vh - (top + h));
      const right = Math.max(0, vw - (left + w));
      setPos({ top, left, bottom, right });
    },
    [dragging, clampToViewport],
  );

  const stopDragging = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
  }, [dragging, pos.top, pos.left, pos.bottom, pos.right]);

  // Publish position to in-memory store
  useEffect(() => {
    persistPosition(pos);
  }, [dragging, pos, persistPosition]);

  useEffect(() => {
    const onMouseUp = () => stopDragging();
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", handlePointerMove, {
      passive: false,
    });
    document.addEventListener("touchend", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", handlePointerMove as any);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [handlePointerMove, stopDragging]);

  const startDragging = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const clientX =
        ("touches" in e
          ? e.touches[0]?.clientX
          : (e as React.MouseEvent).clientX) ?? 0;
      const clientY =
        ("touches" in e
          ? e.touches[0]?.clientY
          : (e as React.MouseEvent).clientY) ?? 0;
      const rect = contentRef.current?.getBoundingClientRect();
      const left = rect?.left ?? pos.left;
      const top = rect?.top ?? pos.top;
      offsetRef.current = { x: clientX - left, y: clientY - top };
      setDragging(true);
    },
    [pos.left, pos.top],
  );

  return (
    <Dialog.Portal>
      {/* No overlay to avoid fixed positioning and allow free-floating dragging */}
      <Dialog.Content
        ref={contentRef}
        style={{
          position: "absolute",
          bottom: pos.bottom,
          right: pos.right,
          zIndex: 51,
          cursor: dragging ? "grabbing" : undefined,
        }}
      >
        <VisuallyHidden.Root>
          <Dialog.Title>{title}</Dialog.Title>
        </VisuallyHidden.Root>
        {typeof children === "function"
          ? children({ startDragging, dragging })
          : children}
      </Dialog.Content>
    </Dialog.Portal>
  );
};

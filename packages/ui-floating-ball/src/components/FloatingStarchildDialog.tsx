import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useFloatingDialogPosition } from "../hooks/useFloatingDialogPosition";

export interface FloatingStarchildDialogProps {
  offset: number;
  children?: React.ReactNode;
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

  // Publish position to in-memory store
  useEffect(() => {
    persistPosition(pos);
  }, [pos, persistPosition]);

  return (
    <Dialog.Portal>
      {/* No overlay to avoid fixed positioning */}
      <Dialog.Content
        ref={contentRef}
        style={{
          position: "absolute",
          bottom: pos.bottom,
          right: pos.right,
          zIndex: 51,
          background: "#07080A",
        }}
      >
        <VisuallyHidden.Root>
          <Dialog.Title>{title}</Dialog.Title>
        </VisuallyHidden.Root>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
};

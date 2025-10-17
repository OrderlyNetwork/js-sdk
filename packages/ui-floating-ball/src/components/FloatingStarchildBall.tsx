import React, { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@orderly.network/ui";
import { FloatingStarchildDialog } from "./FloatingStarchildDialog";
import { StarchildIcon } from "./icons/StarchildIcon";

export interface FloatingBallProps {
  label?: string;
  ariaLabel?: string;
  diameter?: number;
  offset?: number;
  color?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode; // dialog content
  /** Control visibility externally */
  visible?: boolean;
  /** Optional storage key to persist dialog position */
  positionStorageKey?: string;
}

export const FloatingStarchildBall: React.FC<FloatingBallProps> = ({
  label,
  ariaLabel,
  diameter = 60,
  offset = 16,
  color = "#4F46E5",
  icon,
  children,
  visible,
  positionStorageKey,
}) => {
  const [open, setOpen] = useState(false);
  // Visibility state (uncontrolled by default, can be overridden via `visible` prop)
  const [isVisible] = useState(true);
  const showBall = visible ?? isVisible;

  const containerStyle = useMemo<React.CSSProperties>(() => {
    // Base for bottom-right alignment
    const baseBottom = 22;
    const baseRight = -10;
    return {
      position: "fixed",
      zIndex: 50,
      bottom: baseBottom + offset,
      right: baseRight + offset,
      padding: 0,
      background: "transparent",
      border: 0,
      lineHeight: 0,
      cursor: "pointer",
      userSelect: "none",
    };
  }, [offset]);

  if (!showBall) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          aria-label={ariaLabel || label || "Open"}
          title={label}
          style={containerStyle}
        >
          <StarchildIcon size={diameter} />
        </Button>
      </Dialog.Trigger>

      <FloatingStarchildDialog
        offset={offset}
        triggerDiameter={diameter}
        positionStorageKey={positionStorageKey}
      >
        {children}
      </FloatingStarchildDialog>
    </Dialog.Root>
  );
};

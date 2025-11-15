import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export interface FloatingStarchildDialogProps {
  offset: number;
  children?: React.ReactNode;
  title?: string;
}

export const FloatingStarchildDialog: React.FC<
  FloatingStarchildDialogProps
> = ({ offset, children, title = "Bind with Telegram" }) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  // const [pos, setPos] = useState<{
  //   top: number;
  //   left: number;
  //   bottom: number;
  //   right: number;
  // }>(() => {
  //   const baseBottom = 22;
  //   const baseRight = -10;
  //   return {
  //     top: 100,
  //     left: 100,
  //     bottom: baseBottom + offset,
  //     right: baseRight + offset,
  //   };
  // });

  return (
    <Dialog.Portal>
      {/* No overlay to avoid fixed positioning */}
      <Dialog.Content
        ref={contentRef}
        style={{
          position: "absolute",
          bottom: 22 + offset,
          right: -10 + offset,
          zIndex: 51,
          background: "oui-bg-base-10",
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

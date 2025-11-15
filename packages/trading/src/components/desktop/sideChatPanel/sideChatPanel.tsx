import React, { useEffect, useState, useRef } from "react";
import { useStarChildWidget } from "starchild-widget";
import { useEventEmitter } from "@orderly.network/hooks";
import { Box } from "@orderly.network/ui";

export interface SideChatPanelProps {
  scrollBarWidth: number;
  topBarHeight: number;
  bottomBarHeight: number;
}

export const SideChatPanel: React.FC<SideChatPanelProps> = ({
  scrollBarWidth,
  topBarHeight,
  bottomBarHeight,
}) => {
  const ee = useEventEmitter();
  const { showChat } = useStarChildWidget();
  const [isOpen, setIsOpen] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [placeholderRight, setPlaceholderRight] = useState(0);

  useEffect(() => {
    const handleToggle = (data: { isOpen: boolean }) => {
      const isLargeScreen = window.innerWidth > 1440;
      const shouldOpen = isLargeScreen && data.isOpen;

      setIsOpen(shouldOpen);

      if (shouldOpen) {
        try {
          showChat("sideChatContainer");
        } catch (e) {
          console.error("Failed to show chat modal:", e);
        }
      }
    };
    ee.on("sideChatPanel:toggle", handleToggle);
    return () => {
      ee.off("sideChatPanel:toggle", handleToggle);
    };
  }, [ee, showChat]);

  useEffect(() => {
    const handleChatClosed = () => {
      setIsOpen(false);
    };
    window.addEventListener(
      "starchild:chatClosed",
      handleChatClosed as EventListener,
    );
    return () => {
      window.removeEventListener(
        "starchild:chatClosed",
        handleChatClosed as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Only process if width actually changed
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        if (isOpen && currentWidth < 1440) {
          ee.emit("sideChatPanel:toggle", { isOpen: false });
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, ee]);

  useEffect(() => {
    if (!isOpen) {
      setPlaceholderRight(0);
      return;
    }

    let animationFrameId: number;
    let lastRight = 0;
    const updatePlaceholderPosition = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        if (rect.right !== lastRight) {
          lastRight = rect.right;
          setPlaceholderRight(rect.right);
        }
      }
      animationFrameId = requestAnimationFrame(updatePlaceholderPosition);
    };
    updatePlaceholderPosition();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  return (
    <>
      {/* Placeholder to maintain layout space */}
      <Box
        ref={placeholderRef}
        style={{
          width: isOpen ? 400 - 8 - scrollBarWidth : 0,
          flexShrink: 0,
          transition: "width 0.2s ease-in-out",
        }}
      />
      {/* Fixed chat panel */}
      <Box
        id="sideChatContainer"
        r="2xl"
        intensity={900}
        style={{
          width: 400,
          height: `calc(100vh - ${bottomBarHeight}px - ${topBarHeight}px)`,
          position: "fixed",
          top: topBarHeight,
          right: isOpen
            ? window.innerWidth - placeholderRight - 8 - scrollBarWidth
            : -400,
          zIndex: 50,
          transition: "top 0.1s ease-out, right 0.2s ease-in-out",
        }}
        className="oui-flex oui-flex-col oui-gap-3"
      ></Box>
    </>
  );
};

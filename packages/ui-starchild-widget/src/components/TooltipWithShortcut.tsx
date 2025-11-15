import React from "react";
import { cn } from "@orderly.network/ui";

interface KeyboardKeyProps {
  children: React.ReactNode;
  className?: string;
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "oui-bg-base-9",
        "oui-flex oui-items-center oui-justify-center",
        "oui-p-[2px]",
        "oui-rounded-sm",
        "oui-shrink-0",
        className,
      )}
    >
      <span
        className={cn(
          "oui-font-normal",
          "oui-text-3xs",
          "oui-text-base-contrast-80",
          "oui-text-center oui-whitespace-nowrap",
          "oui-tracking-[0.3px]",
        )}
      >
        {children}
      </span>
    </div>
  );
};

export interface TooltipWithShortcutProps {
  text: string;
  keys?: string[];
  className?: string;
}

export const TooltipWithShortcut: React.FC<TooltipWithShortcutProps> = ({
  text,
  keys,
  className,
}) => {
  return (
    <div
      className={cn(
        "oui-flex oui-flex-col",
        "oui-gap-[2px]",
        "oui-items-center oui-justify-center",
        "oui-rounded-md",
        className,
      )}
    >
      {/* Text line */}
      <p
        className={cn(
          "oui-font-semibold",
          "oui-text-2xs",
          "oui-text-base-contrast",
          "oui-text-center oui-whitespace-nowrap",
          "oui-tracking-[0.36px]",
        )}
      >
        {text}
      </p>

      {/* Keyboard shortcuts line */}
      {keys && keys.length > 0 && (
        <div className="oui-flex oui-gap-[2px] oui-items-center">
          {keys.map((key, index) => (
            <KeyboardKey key={index}>{key}</KeyboardKey>
          ))}
        </div>
      )}
    </div>
  );
};

TooltipWithShortcut.displayName = "TooltipWithShortcut";

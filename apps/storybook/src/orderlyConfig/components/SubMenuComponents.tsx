import React from "react";

export const TAB_CONTENT_ANIMATION_CLASSNAME = [
  "oui-origin-top-left",
  "data-[state=open]:oui-animate-in data-[state=closed]:oui-animate-out",
  "data-[state=open]:oui-fade-in-0 data-[state=closed]:oui-fade-out-0",
  "data-[state=open]:oui-zoom-in-95 data-[state=closed]:oui-zoom-out-95",
  "data-[state=open]:oui-slide-in-from-top-2",
  "data-[state=open]:oui-slide-in-from-left-2",
].join(" ");

export type MenuItem = {
  key: string;
  className?: string;
  onClick: () => void;
  onMouseEnter?: () => void;
  activeIcon: React.ReactNode;
  title: string;
  description: string;
  showArrow?: boolean;
  isActive?: boolean;
};

export const MenuItemRow: React.FC<MenuItem> = (props) => {
  const {
    className,
    onClick,
    onMouseEnter,
    activeIcon,
    title,
    description,
    showArrow,
    isActive,
  } = props;
  return (
    <div
      className={`oui-flex oui-items-center oui-justify-between oui-p-3 oui-rounded-md oui-cursor-pointer ${isActive ? "oui-bg-base-5" : "hover:oui-bg-base-6"} ${className ?? ""}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="oui-flex oui-items-center oui-gap-2">
        <div className="oui-w-5 oui-h-5">{activeIcon}</div>
        <div>
          <div className="oui-text-sm oui-font-semibold oui-text-base-contrast-80">
            {title}
          </div>
          {description && (
            <div className="oui-text-xs oui-text-base-contrast-36">
              {description}
            </div>
          )}
        </div>
      </div>
      {showArrow !== false && (
        <div className="oui-text-base-contrast-36">›</div>
      )}
    </div>
  );
};

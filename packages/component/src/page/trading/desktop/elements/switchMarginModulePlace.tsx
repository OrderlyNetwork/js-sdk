import { SwitchOperateIcon } from "@/icon/icons/switchOperateIcon";
import { SwitchMarginModuleTopIcon } from "@/icon/icons/switchMarginModuleTopIcon";
import { SwitchMarginModuleBottomIcon } from "@/icon/icons/switchMarginModuleBottomIcon";
import { useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import { LayoutContext } from "@/layout/layoutContext";

export default function SwitchMarginModulePlace() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const { marginModulePosition, setMarginModulePosition } =
    useContext(LayoutContext);
  return (
    <div
      className="orderly-absolute orderly-top-4 orderly-right-0 orderly-z-[40]"
      ref={triggerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SwitchOperateIcon
        className={cn(
          "orderly-absolute orderly-right-0 orderly-text-base-contrast-20 orderly-top-0 hover:orderly-text-base-contrast-54 orderly-cursor-pointer",
          open && "orderly-text-base-contrast-54"
        )}
      />
      <div
        className={cn(
          "orderly-hidden orderly-mr-3 orderly-p-1 orderly-w-6 orderly-h-12 orderly-border orderly-border-solid orderly-border-base-contrast-12 orderly-rounded-sm orderly-bg-[#16141C] orderly-flex-col orderly-items-center orderly-justify-between",
          open && " orderly-flex"
        )}
      >
        <SwitchMarginModuleTopIcon
          onClick={() => setMarginModulePosition("top")}
          className={cn(
            "orderly-text-base-contrast-54 hover:orderly-text-primary orderly-cursor-pointer orderly-rounded-[2px]",
            marginModulePosition === "top" &&
              "orderly-text-primary orderly-bg-base-500"
          )}
        />
        <SwitchMarginModuleBottomIcon
          onClick={() => setMarginModulePosition("bottom")}
          className={cn(
            "orderly-text-base-contrast-54 hover:orderly-text-primary orderly-cursor-pointer orderly-rounded-[2px]",
            marginModulePosition === "bottom" &&
              "orderly-text-primary orderly-bg-base-500"
          )}
        />
      </div>
    </div>
  );
}

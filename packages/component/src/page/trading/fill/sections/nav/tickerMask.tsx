import { cn } from "@/utils/css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FC } from "react";

interface Props {
  tailing?: boolean;
  leading?: boolean;
  visible?: boolean;
  onClick?: (direction: string) => void;
}

export const TickerMask: FC<Props> = (props) => {
  if (!props.visible) return null;
  const icon = props.tailing ? (
    // @ts-ignore
    <ChevronRight className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80" />
  ) : (
    // @ts-ignore
    <ChevronLeft className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80" />
  );
  return (
    <button
      onClick={() => {
        props.onClick?.(props.leading ? "left" : "right");
      }}
      className={cn(
        "orderly-absolute orderly-top-0 orderly-bottom-0 orderly-w-[70px] orderly-flex orderly-items-center",
        {
          "orderly-left-0 orderly-bg-gradient-to-r orderly-from-[10%] orderly-from-base-900 orderly-to-base-900/10  orderly-pl-1":
            props.leading,
          "orderly-right-0 orderly-bg-gradient-to-r orderly-from-base-900/10 orderly-to-[70%] orderly-to-base-900 orderly-justify-end orderly-pr-1":
            props.tailing,
        }
      )}
    >
      {icon}
    </button>
  );
};

import { FC } from "react";
import { useStarChildInitialized } from "@orderly.network/hooks";
import { cn } from "@orderly.network/ui";
import { StarchildIcon, SlashIcon, StarChildSearchIcon } from "../icons";

export const StarchildSearchButton: FC = () => {
  const isStarChildInitialized = useStarChildInitialized();

  const onClick = () => {
    try {
      const event = new CustomEvent("starchild:openSearch");
      window.dispatchEvent(event);
    } catch (e) {
      // ignore
    }
  };

  if (!isStarChildInitialized) return null;

  return (
    <button
      className={cn(
        "oui-relative oui-z-0 oui-p-px oui-rounded-md oui-transition-all",
        "before:oui-absolute before:oui-inset-0 before:oui-z-[-1] before:oui-rounded-md before:oui-content-['']",
        "after:oui-absolute after:oui-inset-px after:oui-z-[-1] after:oui-box-border after:oui-rounded-md after:oui-content-['']",
        "oui-starchild-gradient-border",
      )}
      onClick={onClick}
      aria-label="Search by Starchild"
    >
      <div
        className={cn(
          "oui-flex oui-items-center oui-relative",
          "oui-px-2 oui-py-1.5 oui-rounded-md",
          "oui-bg-base-9 hover:oui-bg-base-8",
          "oui-text-base-contrast-54 hover:oui-text-base-contrast-80",
          "oui-transition-colors",
        )}
      >
        <StarChildSearchIcon className="oui-w-4.5 oui-h-4.5 oui-shrink-0 oui-mr-1" />
        <span
          className={cn(
            "oui-text-xs oui-font-normal oui-tracking-wider oui-mr-4",
            "oui-bg-gradient-to-l oui-from-[#59B0FE] oui-to-[#26FEFE] oui-bg-clip-text oui-text-transparent",
          )}
        >
          Search by Starchild
        </span>
        <SlashIcon className="oui-w-4.5 oui-h-4.5 oui-shrink-0" />
      </div>
    </button>
  );
};

StarchildSearchButton.displayName = "SearchButton";

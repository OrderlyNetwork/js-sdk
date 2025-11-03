import { FC } from "react";
import { useStarChildInitialized } from "@orderly.network/hooks";
import { cn } from "@orderly.network/ui";
import { SlashIcon, StarChildSearchIcon } from "../icons";

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
        "oui-relative oui-flex oui-items-center oui-z-0 oui-p-px",
        "oui-rounded-md oui-border oui-border-line-12 hover:oui-border-line-16",
        "oui-px-2 oui-py-1.5",
        "oui-bg-base-9",
        "oui-text-base-contrast-54 hover:oui-text-base-contrast-80",
        "oui-transition-colors",
      )}
      onClick={onClick}
      aria-label="Search by Starchild"
    >
      <StarChildSearchIcon className="oui-w-4.5 oui-h-4.5 oui-shrink-0 oui-mr-1" />
      <span
        className={cn(
          "oui-text-2xs oui-font-normal oui-tracking-[0.36px] oui-mr-4",
        )}
      >
        Search
      </span>
      <SlashIcon className="oui-w-4.5 oui-h-4.5 oui-shrink-0" />
    </button>
  );
};

StarchildSearchButton.displayName = "SearchButton";

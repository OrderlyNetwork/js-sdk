import {
  PopoverRoot,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@orderly.network/ui";
import { Input } from "@orderly.network/ui";
import { useEffect, useState } from "react";

export const QuantityInput = (props: { value: number }) => {
  const [quantity] = useState(props.value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // when click the outside of the popover, close the popover
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-popover-root]")) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <PopoverRoot>
      <PopoverTrigger>
        <Input
          size="sm"
          value={quantity}
          onFocus={() => {
            setOpen(true);
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        className="oui-[278px]"
        align="start"
        side="bottom"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div>Quantity slider</div>
      </PopoverContent>
    </PopoverRoot>
  );
};

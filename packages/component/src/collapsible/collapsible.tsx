import { FC } from "react";
import { cn } from "@/utils/css";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent: FC<CollapsiblePrimitive.CollapsibleContentProps> = (
  props
) => {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      {...props}
      className={cn(
        props.className,
        "data-[state=open]:orderly-collapsible-down data-[state=closed]:orderly-collapsible-up"
      )}
    ></CollapsiblePrimitive.CollapsibleContent>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

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
        "grid data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr] transition-all"
      )}
    ></CollapsiblePrimitive.CollapsibleContent>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

import { FC, PropsWithChildren, ReactNode, useMemo } from "react";

import {
  CollapsibleContent,
  Collapsible,
  CollapsibleTrigger,
} from "../collapsible";
import { useCollapseContext } from "./collapseContext";
import { cn } from "@/utils/css";
import { ChevronDown } from "lucide-react";

interface Props {
  header: ReactNode;
  headerClassName?: string;
  itemKey: string;
  disabled?: boolean;
}

export const Panel: FC<PropsWithChildren<Props>> = (props) => {
  const { activeKey, setActiveKey } = useCollapseContext();
  const header = useMemo(() => {
    if (typeof props.header === "string") {
      return (
        <div
          className={cn(
            "orderly-py-2 orderly-border-b orderly-border-divider flex items-center orderly-group orderly-cursor-pointer",
            props.headerClassName
          )}
        >
          <div className="orderly-flex-1 group-data-[state=open]:orderly-font-semibold">
            {props.header}
          </div>
          {/* @ts-ignore */}
          <ChevronDown
            size={16}
            className="group-data-[state=open]:orderly-rotate-180 orderly-transition-transform"
          />
        </div>
      );
    }
    return props.header;
  }, [props.header, props.headerClassName]);

  return (
    <Collapsible
      disabled={props.disabled}
      open={props.itemKey === activeKey}
      onOpenChange={(open) => {
        if (open) {
          setActiveKey(props.itemKey);
        } else {
          setActiveKey("");
        }
      }}
    >
      <CollapsibleTrigger asChild>{header}</CollapsibleTrigger>
      <CollapsibleContent className="orderly-py-3">
        {props.children}
      </CollapsibleContent>
    </Collapsible>
  );
};

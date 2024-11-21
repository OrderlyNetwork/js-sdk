import { FC, PropsWithChildren, ReactNode, useMemo } from "react";

import {
  CollapsibleContent,
  Collapsible,
  CollapsibleTrigger,
} from "../collapsible";
import { useCollapseContext } from "./collapseContext";
import { cn } from "../..";

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
            "oui-py-2 oui-border-b oui-border-divider flex items-center oui-group oui-cursor-pointer",
            props.headerClassName
          )}
        >
          <div className="oui-flex-1 group-data-[state=open]:oui-font-semibold">
            {props.header}
          </div>
          {/* @ts-ignore */}
          <ChevronDown
            size={16}
            className="group-data-[state=open]:oui-rotate-180 oui-transition-transform"
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
      onOpenChange={(open: any) => {
        if (open) {
          setActiveKey(props.itemKey);
        } else {
          setActiveKey("");
        }
      }}
    >
      <CollapsibleTrigger asChild>{header}</CollapsibleTrigger>
      <CollapsibleContent className="oui-py-3">
        {props.children}
      </CollapsibleContent>
    </Collapsible>
  );
};

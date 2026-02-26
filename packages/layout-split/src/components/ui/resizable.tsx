import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@orderly.network/ui";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "aria-[orientation=vertical]:flex-col oui-flex oui-size-full",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "oui-bg-border oui-focus-visible:ring-ring oui-ring-offset-background oui-after:oui-absolute oui-after:oui-inset-y-0 oui-after:oui-left-1/2 oui-after:oui-w-1 oui-after:-oui-translate-x-1/2 oui-focus-visible:ring-1 oui-focus-visible:oui-outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90 oui-relative oui-flex oui-w-px oui-items-center oui-justify-center",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="oui-bg-border oui-z-10 oui-flex oui-h-6 oui-w-1 oui-shrink-0 oui-rounded-lg" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };

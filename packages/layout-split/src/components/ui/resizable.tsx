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
        "aria-[orientation=vertical]:oui-flex-col oui-flex oui-size-full",
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
        "oui-bg-primary focus-visible:oui-ring-ring oui-ring-offset-background after:oui-absolute after:oui-inset-y-0 after:oui-left-1/2 after:oui-w-1 after:-oui-translate-x-1/2 focus-visible:oui-ring-1 focus-visible:oui-outline-hidden aria-[orientation=horizontal]:oui-h-px aria-[orientation=horizontal]:oui-w-full aria-[orientation=horizontal]:after:oui-left-0 aria-[orientation=horizontal]:after:oui-h-1 aria-[orientation=horizontal]:after:oui-w-full aria-[orientation=horizontal]:after:oui-translate-x-0 aria-[orientation=horizontal]:after:-oui-translate-y-1/2 [&[aria-orientation=horizontal]>div]:oui-rotate-90 oui-relative oui-flex oui-w-px oui-items-center oui-justify-center",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="oui-bg-primary oui-z-10 oui-flex oui-h-6 oui-w-1 oui-shrink-0 oui-rounded-lg" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };

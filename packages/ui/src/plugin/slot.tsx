import React, { ElementType, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Slot } from "@radix-ui/react-slot";
import { NotFound } from "./notFound";
import { OrderlyExtensionRegistry } from "./registry";
import { ExtensionPosition } from "./types";
import { useExtensionBuilder } from "./useExtensionBuilder";

interface SlotProps {
  position: ExtensionPosition;
  defaultWidget?: React.FC;
  scope?: string[];
  [key: string]: any;
}

export const ExtensionSlot: React.FC<SlotProps> = (props) => {
  const { position, scope, defaultWidget: defaultValue, ...rest } = props;

  const elementProps = useExtensionBuilder(position, rest);

  const Ele = useMemo<ElementType>(() => {
    const registry = OrderlyExtensionRegistry.getInstance();
    const plugin = registry.getPluginsByPosition(position);
    return plugin?.render ?? defaultValue ?? NotFound;
  }, []);

  return (
    <ErrorBoundary
      fallback={<div>{`Component: [${position}] went wrong`}</div>}
    >
      <Slot {...elementProps} position={position}>
        <Ele />
      </Slot>
    </ErrorBoundary>
  );
};

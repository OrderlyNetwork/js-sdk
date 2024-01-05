import { FC, Fragment, ReactNode, useEffect, useState } from "react";
import { ExtensionPosition } from "./types";
import { OrderlyExtensionRegistry } from "./registry";

interface Props {
  position: ExtensionPosition;
}

export const ExtensionSlot: FC<Props> = (props) => {
  const { position } = props;
  const [component, setComponent] = useState<ReactNode | null>(null);

  useEffect(() => {
    const registry = OrderlyExtensionRegistry.getInstance();
    const plugin = registry.getPluginsByPosition(position);

    if (plugin) {
      setComponent(plugin.render());
    }
  }, []);

  return <Fragment>{component}</Fragment>;
};

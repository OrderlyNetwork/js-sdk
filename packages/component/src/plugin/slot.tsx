import { FC, Fragment, useMemo } from "react";
import { ExtensionPosition } from "./types";
import { OrderlyExtensionRegistry } from "./registry";

interface Props {
  position: ExtensionPosition;
  scope?: string[];
  [key: string]: any;
}

export const ExtensionSlot: FC<Props> = (props) => {
  const { position, scope, ...rest } = props;
  // const [component, setComponent] = useState<ReactNode | null>(null);
  //
  const plugin = useMemo(() => {
    const registry = OrderlyExtensionRegistry.getInstance();
    const plugin = registry.getPluginsByPosition(position);
    return plugin;
  }, []);

  const _innerProps = plugin?.builder?.() || rest;

  console.log("plugin", plugin, _innerProps);

  const Ele = useMemo(() => {
    const registry = OrderlyExtensionRegistry.getInstance();
    const plugin = registry.getPluginsByPosition(position);

    // if (plugin) {
    //   setComponent(plugin.render({}));
    // }
    return plugin?.render;
  }, []);

  return <Fragment>{Ele ? <Ele {...rest} /> : null}</Fragment>;
};

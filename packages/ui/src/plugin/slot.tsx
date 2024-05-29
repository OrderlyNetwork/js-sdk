import { FC, Fragment, useMemo } from "react";
import { ExtensionPosition } from "./types";
import { OrderlyExtensionRegistry } from "./registry";
import { useExtensionBuilder } from "./useExtensionBuilder";

interface Props {
  position: ExtensionPosition;
  scope?: string[];
  [key: string]: any;
}

export const ExtensionSlot: FC<Props> = (props) => {
  const { position, scope, ...rest } = props;
  // const [component, setComponent] = useState<ReactNode | null>(null);
  //

  const elementProps = useExtensionBuilder(position);

  console.log("👉elementProps", elementProps);

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

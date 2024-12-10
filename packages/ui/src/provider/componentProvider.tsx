import { ExtensionPosition, installExtension } from "../plugin";
import { ComponentType, FC, PropsWithChildren, useEffect } from "react";

/// layout cache: size, position

const ComponentsProvider: FC<
  PropsWithChildren<{
    components?: { [position in ExtensionPosition]: ComponentType };
  }>
> = (props) => {
  useEffect(() => {
    if (props.components && Object.keys(props.components).length) {
      for (const position in props.components) {
        const Element = props.components[position];
        installExtension<any>({
          name: Element.displayName ?? `custom-component-${position}`,
          scope: ["*"],
          positions: [position],
          __isInternal: false,
        })((props: any) => {
          return <Element {...props} />;
        });
      }
    }
  }, [props.components]);

  return props.children;
};

export { ComponentsProvider };

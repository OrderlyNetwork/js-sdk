import { ExtensionPosition } from "../plugin";
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
        console.log(position, props.components[position]);
      }
    }
  }, [props.components]);

  return props.children;
};

export { ComponentsProvider };

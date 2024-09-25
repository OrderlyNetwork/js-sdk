import { FC, PropsWithChildren, useState } from "react";
import { CollapseContext } from "./collapseContext";
import { Panel } from "./panel";

const CollapseRoot: FC<
  PropsWithChildren<{
    activeKey?: string;
  }>
> = (props) => {
  const [activeKey, setActiveKey] = useState<string>(props.activeKey ?? "");
  return (
    <CollapseContext.Provider value={{ activeKey, setActiveKey }}>
      {props.children}
    </CollapseContext.Provider>
  );
};

type Collapse = typeof CollapseRoot & {
  panel: typeof Panel;
};

const Collapse = CollapseRoot as Collapse;

Collapse.panel = Panel;

export default Collapse;

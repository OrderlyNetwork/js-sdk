import { FC, useMemo } from "react";

import { path } from "ramda";
import { Type } from "../Type";

interface MethodProps {
  method: any;
}

export const MethodItem: FC<MethodProps> = (props) => {
  const { method } = props;

  const { name, signature } = method;

  const parameters = useMemo(() => {
    return path(["signatures", 0, "parameters"], method);
  }, [method]);

  const returns = useMemo(() => {
    return path(["signatures", 0, "returnType"], method);
  }, [method]);

  //   console.log(returns);

  return (
    <div>
      <div className="text-lg font-semibold">{name}</div>
      <div></div>

      <div>Parameters</div>

      <ul>
        {parameters?.map((param: any) => {
          return (
            <li key={param.id} className="flex gap-1">
              <span className="text-blue-400">{param.name}</span>
              <span>:</span>
              <Type type={param.type} />
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <strong>Returns</strong>
        <Type type={returns} />
      </div>
    </div>
  );
};

import { FC, useMemo } from "react";

import { path } from "ramda";
import { Type } from "../Type";
import { Link } from "lucide-react";

interface MethodProps {
  method: any;
}

export const MethodItem: FC<MethodProps> = (props) => {
  const { method } = props;

  console.log("------method--->>>>>>>", method);

  const { name, signature } = method;

  const parameters = useMemo(() => {
    return path(["signatures", 0, "parameters"], method);
  }, [method]);

  const returns = useMemo(() => {
    return path(["signatures", 0, "returnType"], method);
  }, [method]);

  const signatures = useMemo(() => {
    return path(["signatures"], method);
  }, [method]);

  //   console.log(returns);

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold flex items-center">
        <a id={`#${name}`}></a>
        {name}
        <a href={`#${name}`}>
          <Link size={16} className="stroke-gray-400 ml-2" />
        </a>
      </div>
      <div className="border-t border-b border-gray-300 py-3">
        {signatures?.map((signature: any) => {
          return (
            <div key={signature.id}>
              <span className="text-blue-400">{signature.name}</span>
              {Array.isArray(signature.typeParameters) &&
                signature.typeParameters.length > 0 && (
                  <>
                    <span>&lt;</span>
                    <span className="text-rose-500 space-x-1">
                      {signature.typeParameters?.map((param: any, index) => {
                        return <span key={param.id}>{param.name}</span>;
                      })}
                    </span>

                    <span>&gt;</span>
                  </>
                )}

              <span className="text-gray-500">(</span>
              <span className="space-x-1">
                {signature.parameters?.map((param: any, index) => {
                  if (index + 1 === signature.parameters.length) {
                    return (
                      <span key={param.id} className="text-blue-400">
                        {`${param.name}${param.optional ? "?" : ""}`}
                      </span>
                    );
                  }

                  return (
                    <>
                      <span key={param.id} className="text-blue-400">
                        {`${param.name}${param.optional ? "?" : ""}`}
                      </span>
                      <span>,</span>
                    </>
                  );
                })}
              </span>

              <span className="text-gray-500">)</span>

              {signature.returnType ? (
                <>
                  <span className="text-gray-500 mr-1">:</span>
                  <Type type={signature.returnType} />
                </>
              ) : null}
            </div>
          );
        })}
      </div>

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

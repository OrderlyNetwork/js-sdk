import { FC, Fragment, useMemo } from "react";
import { PageHeader } from "../pageHeader";
import { Type } from "../Type";

interface Props {
  doc: any;
}

export const FunctionPage: FC<Props> = (props) => {
  const { doc } = props;

  const type = useMemo(() => {
    if (!doc || !doc.name) {
      return "Function";
    }
    if (doc?.name.startsWith("use")) {
      return "React Hook";
    }
    return "Function";
  }, [doc.name]);

  return (
    <div>
      <PageHeader title={doc.name} type={type} />
      {doc.signatures.map((signature, index) => {
        return (
          <div className="space-y-7" key={signature.id}>
            <div className="space-x-1 border-t border-b border-gray-300 py-4">
              <span className="text-sky-600">{doc.name}</span>
              {Array.isArray(signature.typeParameters) &&
              signature.typeParameters.length > 0 ? (
                <span>
                  <span>&lt;</span>
                  <span className="text-rose-500">
                    {signature.typeParameters.map((item, index) => {
                      if (index + 1 === signature.typeParameters.length) {
                        return <strong key={index}>{item.name}</strong>;
                      }
                      return (
                        <Fragment key={index}>
                          <strong>{item.name}</strong>
                          <span className="mx-1">,</span>
                        </Fragment>
                      );
                    })}
                  </span>
                  <span>&gt;</span>
                </span>
              ) : null}
              <span>
                <span className="text-gray-500">(</span>

                <span className="text-blue-500">
                  {Array.isArray(signature.parameters) &&
                    signature.parameters
                      .map((param, index) => {
                        return `${param.name}${param.optional ? "?" : ""}`;
                      })
                      .join(", ")}
                </span>
                <span className="text-gray-500">)</span>
              </span>
              <span className="mr-1">:</span>
              <Type type={signature.returnType} />
            </div>
            <div>
              <div className="text-xl mb-2 font-semibold">Parameters</div>
              <ul className="list-inside list-disc space-y-2">
                {signature.parameters.map((param, index) => {
                  return (
                    <li key={param.id}>
                      {param.optional ? (
                        <span className="border border-gray-400 rounded-full font-semibold px-2 mr-2 text-sm">
                          Optional
                        </span>
                      ) : null}

                      <span className="text-blue-500">{param.name}</span>
                      <span className="mr-1">:</span>
                      <Type type={param.type} />
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <strong className="text-xl mb-2 font-semibold mr-2">
                Returns
              </strong>
              <Type type={signature.returnType} />
            </div>
            {/* <ul className="list-disc list-inside">{
              signature.returnType.properties.map((item,index)=>{
                return <li>
                  <span>{item.name}</span>
                </li>
              })
            }</ul> */}
          </div>
        );
      })}

      {/* params */}
      <div></div>
    </div>
  );
};

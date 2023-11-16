import { FC, Fragment } from "react";
import { Type } from "../Type";

interface ReflectionProps {
  type: any;
}

export const Reflection: FC<ReflectionProps> = (props) => {
  const { type } = props;

  if (Array.isArray(type.properties) && type.properties.length > 0) {
    return (
      <span>
        <span>&#123;</span>
        <br />
        {type.properties.map((property, index) => {
          const item = (
            <span className="pl-5">
              <span className="text-blue-500">{property.name}</span>
              <span className="mr-1">:</span>
              <Type key={property.id} type={property.type} />
            </span>
          );
          if (index + 1 === type.properties.length) {
            return item;
          }
          return (
            <>
              {item}
              <span className="mr-1">,</span>
              <br />
            </>
          );
        })}
        <br />
        <span>&#125;</span>
      </span>
    );
  }

  if (Array.isArray(type.signatures) && type.signatures.length > 0) {
    return (
      <>
        {type.signatures.map((signature, index) => {
          return (
            <span key={signature.id}>
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
                    <Fragment key={param.id}>
                      <span key={param.id} className="text-blue-400">
                        {`${param.name}${param.optional ? "?" : ""}`}
                      </span>
                      <span>,</span>
                    </Fragment>
                  );
                })}
              </span>

              <span className="text-gray-500">)</span>

              {signature.returnType ? (
                <>
                  <span className="text-gray-500 mx-1">{"=>"}</span>
                  <Type type={signature.returnType} />
                </>
              ) : null}
            </span>
          );
        })}
      </>
    );
  }

  return <span></span>;
};

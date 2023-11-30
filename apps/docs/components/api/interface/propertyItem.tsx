import Link from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { FC, Fragment, useMemo } from "react";
import { Type } from "../Type";
import { path } from "ramda";
import { Anchor } from "@/components/layout/anchor";
import { AnchorElement } from "@/components/layout/anchorElement";

interface Props {
  name: string;
  type: any;
  readonly?: boolean;
  optional?: boolean;
}

export const PropertyItem: FC<Props> = (props) => {
  const { name, type, readonly, optional } = props;

  // console.log("---------PropertyItem------->>>>", props);

  const isGetter = useMemo(() => {
    return Array.isArray(type.signatures);
  }, [type.signatures]);

  return (
    <div className="space-y-3">
      <div className="text-lg font-bold py-2 flex items-center">
        {/* <a id={name} className="scroll-mt-[90px]"></a> */}
        <AnchorElement name={name} />
        {optional ? (
          <span className="border border-gray-400 rounded-full font-semibold px-2 mr-2 text-sm">
            Optional
          </span>
        ) : null}

        <span className="text-xl">{name}</span>
        <Anchor name={name} />
        {/* <a href={`#${name}`}>
          <LinkIcon size={14} className="stroke-gray-400 ml-2" />
        </a> */}
      </div>
      <div className="flex space-x-1 bg-primary-light p-3 rounded-lg">
        <span>
          {isGetter ? <span className="mr-1 text-gray-500">get</span> : null}
          <span className="text-blue-500">{`${name}${isGetter ? "()" : ""}${
            optional ? "?" : ""
          }`}</span>
          <span className="mr-1">:</span>
          <Type type={type} />
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <strong>Type declaration</strong>
        </div>

        {Array.isArray(type.signatures) && type.signatures.length > 0 ? (
          <>
            <div>
              <strong>Parameters</strong>
            </div>
            <ul className="list-inside list-disc">
              {type.signatures.map((signature: any) => {
                return signature.parameters.map((param: any, index: number) => {
                  return (
                    <li key={param.id} className="space-x-1">
                      <span className="text-blue-500">{`${param.name}:`}</span>
                      <Type type={param.type} />
                    </li>
                  );
                });
              })}
            </ul>
          </>
        ) : null}
        <div>
          <strong className="mr-1">Returns:</strong>
          <Type type={type} />
        </div>
      </div>
    </div>
  );
};

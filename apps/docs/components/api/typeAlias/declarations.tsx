import { FC, PropsWithChildren } from "react";
import { Type } from "@/components/api/Type";

export const Declarations: FC<PropsWithChildren<{ declarations: any[] }>> = (
  props
) => {
  if (!Array.isArray(props.declarations) || props.declarations.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={"text-xl mb-2 font-semibold"}>Type declaration</div>
      <ul className={"list-disc list-inside space-y-2 ml-5"}>
        {props.declarations.map((declaration, index) => {
          return (
            <li key={declaration.id}>
              <span className={"text-blue-500 font-semibold"}>
                {declaration.name}
              </span>
              <span className={"mr-2"}>:</span>
              <Type type={declaration.type} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

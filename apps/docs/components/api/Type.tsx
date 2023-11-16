import { FC } from "react";
import { Union } from "./types/union";
import { Reflection } from "./types/reflection";

interface Props {
  type: { kind: string; [key: string]: any };
}

export const Type: FC<Props> = (props) => {
  const { kind, type, name, typeArguments, properties } = props.type;
  console.log("--------Type------>>>>", props.type);

  if (kind === "intrinsic") {
    return <span>{type}</span>;
  }

  if (kind === "union") {
    return <Union type={props.type} />;
  }

  if (kind === "reference") {
    if (Array.isArray(typeArguments) && typeArguments.length > 0) {
      return (
        <span>
          <span>{name}</span>
          <span>&lt;</span>
          {typeArguments.map((item, index) => {
            if (index + 1 === typeArguments.length) {
              return <Type type={item} key={index} />;
            }
            return (
              <>
                <Type type={item} key={index} />
                <span className="mx-1">,</span>
              </>
            );
          })}
          <span>&gt;</span>
        </span>
      );
    }
    return <span>{name}</span>;
  }

  if (kind === "reflection") {
    return <Reflection type={props.type} />;
  }

  return <div></div>;
};

import { encodeName } from "@/helper/typedocParser/name";
import Link from "next/link";
import { FC } from "react";
import { Type } from "../Type";

interface Props {
  type: any;
}

export const Reference: FC<Props> = (props) => {
  const { typeArguments, name } = props.type;

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

  if (props.type.id === -1) {
    return <span className="text-rose-500 font-semibold ">{name}</span>;
  }

  return (
    <Link
      className="text-rose-500 font-semibold italic underline hover:text-rose-600"
      href={
        props.type.packageName
          ? `/apis/modules/${encodeName(props.type.packageName)}/${name}`
          : props.type.name
      }
    >
      {name}
    </Link>
  );
};

import { FC } from "react";
import { Union } from "./types/union";
import { Reflection } from "./types/reflection";
import Link from "next/link";
import { encodeName } from "@/helper/typedocParser/name";
import { Reference } from "./types/reference";
import { TypeOperator } from "./types/typeOperator";
import { Tuple } from "./types/tuple";
import { Array } from "./types/array";

interface Props {
  type: { kind: string; [key: string]: any };
  className?: string;
}

export const Type: FC<Props> = (props) => {
  const { kind, type, name, typeArguments, properties } = props.type;
  // console.log("--------Type------>>>>", props.type);

  if (kind === "intrinsic") {
    return <span>{type}</span>;
  }

  if (kind === "literal") {
    return <span>{props.type.value}</span>;
  }

  if (kind === "union") {
    return <Union type={props.type} />;
  }

  if (kind === "reference") {
    return <Reference type={props.type} />;
  }

  if (kind === "reflection") {
    return <Reflection type={props.type} />;
  }

  if (kind === "typeOperator") {
    return <TypeOperator type={props.type} />;
  }

  if (kind === "tuple") {
    return <Tuple type={props.type} />;
  }

  if (kind === "array") {
    return <Array type={props.type} />;
  }

  return <div></div>;
};

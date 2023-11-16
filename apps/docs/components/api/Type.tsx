import { FC } from "react";
import { Union } from "./types/union";
import { Reflection } from "./types/reflection";
import Link from "next/link";
import { encodeName } from "@/helper/typedocParser/name";
import { Reference } from "./types/reference";

interface Props {
  type: { kind: string; [key: string]: any };
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

  return <div></div>;
};

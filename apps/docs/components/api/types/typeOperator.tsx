import { FC } from "react";
import { Type } from "../Type";

interface Props {
  type: any;
}

export const TypeOperator: FC<Props> = (props) => {
  const { type } = props;
  return (
    <>
      <span>{type.operator}</span>

      <Type type={type.type} />
    </>
  );
};

import { FC } from "react";
import { Type } from "../Type";

export interface Props {
  type: any;
}

export const Array: FC<Props> = (props) => {
  const { type } = props;
  return (
    <span>
      <Type type={type.type} />
      <span className="text-gray-500">{"[]"}</span>
    </span>
  );
};

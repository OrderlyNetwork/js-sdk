import { FC } from "react";
import { pathOr } from "ramda";

export const Comment: FC<{ doc: any }> = (props) => {
  const { doc } = props;
  return (
    <div>
      <div>{pathOr("", ["comment", "description"])(doc)}</div>
    </div>
  );
};

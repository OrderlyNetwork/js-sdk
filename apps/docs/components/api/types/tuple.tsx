import { FC } from "react";
import { Type } from "../Type";

interface Props {
  type: any;
}

export const Tuple: FC<Props> = (props) => {
  const { type } = props;

  return (
    <span>
      <span>{"["}</span>
      {Array.isArray(type.types) &&
        type.types.map((item, index) => {
          if (index + 1 === type.types.length) {
            return <Type type={item} key={index} />;
          }
          return (
            <>
              <Type type={item} key={index} />
              <span className="mx-1">,</span>
            </>
          );
        })}
      <span>{"]"}</span>
    </span>
  );
};

import { FC, Fragment } from "react";
import { Type } from "../Type";

interface UnionProps {
  type: any;
}

export const Union: FC<UnionProps> = (props) => {
  const { types } = props.type;

  return (
    <span className="space-x-1">
      {types.map((type, index) => {
        if (index + 1 === types.length) {
          return <Type type={type} key={index} />;
        }
        return (
          <Fragment key={index}>
            <Type type={type} />
            <span className="text-slate-400">|</span>
          </Fragment>
        );
      })}
    </span>
  );
};

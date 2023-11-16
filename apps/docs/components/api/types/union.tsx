import { FC } from "react";
import { Type } from "../Type";

interface UnionProps {
  type: any;
}

export const Union: FC<UnionProps> = (props) => {
  const { types } = props.type;
  console.log("--------", types);

  return (
    <>
      {types.map((item, index) => {
        if (index + 1 === types.length) {
          return <Type type={item} key={index} />;
        }
        return (
          <>
            <Type type={item} key={index} />
            <span className="text-slate-400">|</span>
          </>
        );
      })}
    </>
  );
  return <span></span>;
};

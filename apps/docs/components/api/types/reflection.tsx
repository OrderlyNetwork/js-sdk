import { FC } from "react";
import { Type } from "../Type";

interface ReflectionProps {
  type: any;
}

export const Reflection: FC<ReflectionProps> = (props) => {
  const { type } = props;
  console.log("------ Reflection", type);

  if (Array.isArray(type.properties) && type.properties.length > 0) {
    return (
      <span className="text-red-500">
        {type.properties.map((property) => {
          return <Type key={property.id} type={property} />;
        })}
      </span>
    );
  }

  return <span></span>;
};

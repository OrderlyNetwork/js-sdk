import { FC } from "react";

interface Props {
  type: { kind: string; [key: string]: any };
}

export const Type: FC<Props> = (props) => {
  const { kind, type, name, typeArguments } = props.type;
  console.log(props.type);

  if (kind === "intrinsic") {
    return <span>{type}</span>;
  }

  if (kind === "reference") {
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
                <span>,</span>
              </>
            );
          })}
          <span>&gt;</span>
        </span>
      );
    }
    return <span>{name}</span>;
  }

  return <div></div>;
};

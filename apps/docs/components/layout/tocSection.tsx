import { FC } from "react";

interface Props {
  data: any[];
}

export const TOCSection: FC<Props> = (props) => {
  const { data } = props;

  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <>
      {data.map((item, index) => {
        return (
          <li>
            <a href={`#${item.name}`} key={item.id}>
              {item.name}
            </a>
          </li>
        );
      })}
    </>
  );
};

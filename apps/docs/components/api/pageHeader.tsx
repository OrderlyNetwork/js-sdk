import { FC } from "react";

interface Props {
  title: string;
  type: string;
}

export const PageHeader: FC<Props> = ({ title, type }) => {
  return (
    <div>
      <h2 className="text-4xl pt-2 pb-6 flex items-center gap-2">
        <span className="text-gray-500">{type}</span>
        <span>{title}</span>
      </h2>
    </div>
  );
};

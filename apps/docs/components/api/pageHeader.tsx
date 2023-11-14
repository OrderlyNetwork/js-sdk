import { FC } from "react";

interface Props {
  title: string;
}

export const PageHeader: FC<Props> = ({ title }) => {
  return (
    <div>
      <h2 className="text-4xl py-5">{title}</h2>
    </div>
  );
};

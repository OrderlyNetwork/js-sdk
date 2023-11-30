import { FC, PropsWithChildren } from "react";

interface Props {
  title: string;
}

export const SectionPane: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <div>
      <div className="px-4 text-sm">{props.title}</div>
      <div className="text-sm text-base-contrast-54 px-4">{props.children}</div>
    </div>
  );
};

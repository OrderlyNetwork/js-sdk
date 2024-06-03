import { FC } from "react";

export const NotFound: FC<{ position: string }> = (props) => {
  const { position } = props;
  return (
    <div className="oui-text-danger">
      <strong>{`[${position}] `}</strong>
      <span>Not found!</span>
    </div>
  );
};

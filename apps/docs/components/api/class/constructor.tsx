import { FC } from "react";

interface Props {
  data: any;
}

export const Constructor: FC<Props> = ({ data }) => {
  return (
    <div>
      <div className="text-2xl">Constructor</div>

      <div className="text-xl">Parameters</div>

      <ul>
        <li>configStore: ConfignStore</li>
      </ul>
    </div>
  );
};

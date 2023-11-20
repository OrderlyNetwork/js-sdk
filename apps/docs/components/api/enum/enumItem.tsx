import { FC } from "react";

interface Props {
  data: any;
}

export const EnumItem: FC<Props> = (props) => {
  const { data } = props;

  return (
    <div>
      <div className="text-xl mb-3 font-semibold">{data.name}</div>

      <div className="bg-primary-light p-3 rounded-lg">
        <span className="text-orange-500">{data.name}</span>
        <span className="mr-2">:</span>
        <span className="italic">{`"${data.value}"`}</span>
      </div>
    </div>
  );
};

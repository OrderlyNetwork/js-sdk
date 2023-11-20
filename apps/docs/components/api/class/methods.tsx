import { FC } from "react";
import { MethodItem } from "./method";

interface Props {
  methods: any[];
}

export const Methods: FC<Props> = (props) => {
  const { methods } = props;
  if (!methods.length) return null;
  return (
    <div>
      <div className="text-2xl mb-5 mt-7">Methods</div>
      <div className="space-y-10">
        {methods.map((method) => {
          return <MethodItem key={method.id} method={method} />;
        })}
      </div>
    </div>
  );
};

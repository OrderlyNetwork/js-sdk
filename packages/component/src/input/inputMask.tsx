import { FC, PropsWithChildren } from "react";

export const InputMask: FC<PropsWithChildren> = (props) => {
  return (
    <div className="h-full flex flex-col justify-center px-2">
      {props.children}
    </div>
  );
};

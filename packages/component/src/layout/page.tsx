import { FC, HTMLAttributes, PropsWithChildren, useMemo } from "react";
import { usePreLoadData } from "@orderly.network/hooks";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  // systemState: SystemStateEnum;
}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  const { error, done } = usePreLoadData();

  if (error) {
    return <div className="orderly-text-danger">Data load failed:</div>;
  }

  if (!done) return null;

  return (
    <>
      {props.children}
      {/* {loadingMask} */}
    </>
  );
};

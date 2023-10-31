import { FC, HTMLAttributes, PropsWithChildren, useMemo } from "react";
import { usePreLoadData } from "@orderly.network/hooks";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  // systemState: SystemStateEnum;
}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  const { error, done } = usePreLoadData();
  // const loadingMask = useMemo(() => {
  //   if (props.systemState === SystemStateEnum.Loading) {
  //     return (
  //       <div className="fixed left-0 top-0 right-0 bottom-0 bg-base-100/80 flex justify-center items-center z-50">
  //         Loading
  //       </div>
  //     );
  //   }
  //   return null;
  // }, [props.systemState]);

  if (error) {
    return <div className="text-danger">Data load failed:</div>;
  }

  if (!done) return null;

  return (
    <>
      {props.children}
      {/* {loadingMask} */}
    </>
  );
};

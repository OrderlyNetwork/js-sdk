import {
  FC,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useMemo,
} from "react";
import { usePreLoadData } from "@orderly.network/hooks";

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  // systemState: SystemStateEnum;
  full: ReactNode;
  mobile: ReactNode;
}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  // const { error, done } = usePreLoadData();
  // const loadingMask = useMemo(() => {
  //   if (props.systemState === SystemStateEnum.Loading) {
  //     return (
  //       <div className="orderly-fixed orderly-left-0 orderly-top-0 orderly-right-0 orderly-bottom-0 orderly-bg-base-300/80 orderly-flex orderly-justify-center orderly-items-center orderly-z-50">
  //         Loading
  //       </div>
  //     );
  //   }
  //   return null;
  // }, [props.systemState]);

  // if (error) {
  //   return <div className="orderly-text-danger">Data load failed:</div>;
  // }

  // if (!done) return null;

  return (
    <>
      {props.children}
      {/* {loadingMask} */}
    </>
  );
};

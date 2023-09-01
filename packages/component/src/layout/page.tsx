import { FC, HTMLAttributes, PropsWithChildren, useMemo } from "react";
import { cn } from "@/utils/css";
import { SystemStateEnum } from "@orderly.network/types";

// const pageVariants = cva([],{
//   variants: {
//
//   }
// });

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  systemState: SystemStateEnum;
}

export const Page: FC<PropsWithChildren<PageProps>> = (props) => {
  const loadingMask = useMemo(() => {
    if (props.systemState === SystemStateEnum.Loading) {
      return (
        <div className="fixed left-0 top-0 right-0 bottom-0 bg-base-100/80 flex justify-center items-center z-50">
          Loading
        </div>
      );
    }
    return null;
  }, [props.systemState]);

  return (
    <>
      {props.children}
      {loadingMask}
    </>
  );
};

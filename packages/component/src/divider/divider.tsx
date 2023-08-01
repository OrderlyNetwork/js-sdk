import { FC, PropsWithChildren, useMemo } from "react";

export interface DividerProps {
  color?: string;
  margin?: number;
}

export const Divider: FC<PropsWithChildren<DividerProps>> = (props) => {
  const children = useMemo(() => {
    if (typeof props.children === "undefined") return null;
    return <div className="px-2">{props.children}</div>;
  }, [props.children]);

  return (
    <div className="flex items-center min-h-[10px] before:block before:content-[' '] before:h-[1px] before:border-b before:border-solid before:w-[50%] after:block after:content-[' '] after:h-[1px] after:border-b after:border-solid after:w-[50%] whitespace-nowrap">
      {children}
    </div>
  );
};

import { NoData } from "@/illustration";
import { FC, useMemo } from "react";
import { cn } from "..";

interface EmptyViewProps {
  // visible?: boolean;
  text?: string;
  icon?: React.ReactNode;
  iconSize?: number;
  className?: string;
}

export const EmptyView: FC<EmptyViewProps> = (props) => {
  const icon = useMemo(() => {
    return <NoData width={props.iconSize || 101} height={props.iconSize || 101}/>;
  }, [props.icon]);

  const text = useMemo(() => {
    return <div className="orderly-text-3xs">No results found.</div>;
  }, [props.text]);

  return (
    <div className={cn("orderly-flex orderly-flex-col orderly-items-center orderly-justify-center orderly-min-h-[180px]", props.className)}>
      <div>{icon}</div>
      <div className="orderly-text-base-contrast-54">{text}</div>
    </div>
  );
};

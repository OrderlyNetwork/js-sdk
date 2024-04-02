import { NoData } from "@/illustration";
import { FC, useMemo } from "react";

interface EmptyViewProps {
  // visible?: boolean;
  text?: string;
  icon?: React.ReactNode;
}

export const EmptyView: FC<EmptyViewProps> = (props) => {
  const icon = useMemo(() => {
    return <NoData />;
  }, [props.icon]);

  const text = useMemo(() => {
    return <div className="orderly-text-3xs">No results found.</div>;
  }, [props.text]);

  return (
    <div className="orderly-flex orderly-flex-col orderly-items-center orderly-justify-center orderly-h-full orderly-absolute orderly-left-1/2 orderly-translate-x-[-50%]">
      <div>{icon}</div>
      <div className="orderly-text-base-contrast-54">{text}</div>
    </div>
  );
};

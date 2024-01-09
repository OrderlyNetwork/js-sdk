import { NoData } from "@/illustration";
import { FC, useMemo } from "react";

interface EmptyViewProps {
  visible?: boolean;
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

  if (!props.visible) {
    return null;
  }

  return (
    <div className="orderly-flex orderly-flex-col orderly-items-center orderly-justify-center">
      <div>{icon}</div>
      <div className="orderly-p-5">{text}</div>
    </div>
  );
};

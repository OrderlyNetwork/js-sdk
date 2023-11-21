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
    return <div className={"text-3xs"}>No results found.</div>;
  }, [props.text]);

  return (
    <div className={"flex flex-col items-center justify-center py-[50px]"}>
      <div>{icon}</div>
      <div className={"p-5"}>{text}</div>
    </div>
  );
};

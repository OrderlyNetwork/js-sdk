import { Spinner } from "@/spinner";
import { cn } from "@/utils/css";
import { Check } from "lucide-react";
import { FC, PropsWithChildren, useMemo } from "react";

export interface StepItemProps {
  active?: boolean;
  isLoading?: boolean;
  isCompleted: boolean;
}

export const StepItem: FC<PropsWithChildren<StepItemProps>> = (props) => {
  const child = useMemo(() => {
    if (props.isLoading) {
      return <Spinner size="small" />;
    }
    if (props.isCompleted) {
      return <Check />;
    }
    return props.children;
  }, [props.isLoading, props.isCompleted]);
  return (
    <div
      className={cn(
        "flex items-center justify-center w-[32px] h-[32px] bg-base-100 rounded-full",
        props.active && "bg-primary",
        props.isLoading && "bg-white/10 border border-primary",
        props.isCompleted && "bg-white/10 border border-primary text-primary"
      )}
    >
      {child}
    </div>
  );
};

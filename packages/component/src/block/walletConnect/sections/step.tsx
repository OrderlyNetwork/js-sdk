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
      // @ts-ignore
      return <Check size={20} />;
    }
    return props.children;
  }, [props.isLoading, props.isCompleted]);
  return (
    <div
      className={cn(
        "orderly-flex orderly-items-center orderly-justify-center orderly-w-[32px] orderly-h-[32px] orderly-bg-base-100 orderly-rounded-full",
        props.active && "orderly-bg-primary",
        props.isLoading &&
          "orderly-bg-white/10 orderly-border orderly-border-primary",
        props.isCompleted &&
          "orderly-bg-white/10 orderly-border orderly-border-primary orderly-text-primary"
      )}
    >
      {child}
    </div>
  );
};

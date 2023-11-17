import { ListTile } from "@/listView";
import { Spinner } from "@/spinner";
import { cn } from "@/utils/css";
import { Check, X } from "lucide-react";
import { FC, useMemo } from "react";

export type StatusTileState = "pending" | "success" | "failed" | "disabled";

interface StatusTileProps {
  state: StatusTileState;
  title: string;
  description: string;
  index: number;
}

export const StatusTile: FC<StatusTileProps> = (props) => {
  const leadingElement = useMemo(() => {
    if (props.state === "disabled") {
      return (
        <div className="orderly-w-[32px] orderly-h-[32px] orderly-rounded-full orderly-bg-base-400 orderly-text-base-contrast-54 orderly-flex orderly-justify-center orderly-items-center">
          {props.index}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "w-[32px] h-[32px] rounded-full text-base-contrast flex justify-center items-center border border-primary-light",
          props.state === "failed" && "border-danger"
        )}
      >
        {props.state === "pending" ? (
          <Spinner size={"small"} background={"transparent"} />
        ) : props.state === "success" ? (
          <Check size={18} className="orderly-text-primary-light" />
        ) : (
          <X size={18} className="orderly-text-danger" />
        )}
      </div>
    );
  }, [props.state, props.index]);

  return (
    <ListTile
      title={props.title}
      className="orderly-text-xs subtitle:orderly-text-3xs subtitle:orderly-text-base-contrast-36"
      subtitle={props.description}
      avatar={leadingElement}
      disabled={props.state === "disabled"}
    />
  );
};

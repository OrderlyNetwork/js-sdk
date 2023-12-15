import { X } from "lucide-react";
import { FC } from "react";

export const ConfirmHeader: FC<{
  onClose: () => void;
  title: string;
}> = (props) => {
  return (
    <div className="orderly-pb-3 orderly-border-b orderly-border-divider orderly-relative">
      <div className="orderly-text-xl">{props.title}</div>
      <button
        onClick={props.onClose}
        className="orderly-absolute orderly-right-0 orderly-top-0 orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80 orderly-p-2"
      >
        <X size={18} />
      </button>
    </div>
  );
};

import { FC } from "react";
import { clsx } from "clsx";

interface Props {
  color: string;
  name: string;
}

export const ColorCell: FC<Props> = (props) => {
  return (
    <div className={clsx("w-10 h-10 rounded color-item overflow-hidden")}>
      <div className={clsx("w-full h-full", props.color)}></div>
    </div>
  );
};

export interface ColorBlockProps {
  colors: Props[];
  groupName: string;
}

export const ColorList: FC<ColorBlockProps> = (props) => {
  return (
    <div>
      <div className="pb-1 text-sm">{props.groupName}</div>
      <div className="flex flex-row gap-2">
        {props.colors?.map((color) => {
          return <ColorCell color={color.color} name={color.name} />;
        })}
      </div>
    </div>
  );
};

export const Colors = () => {
  return (
    <div className="py-3 space-y-3">
      <div className="flex space-x-8">
        <ColorList
          groupName="base"
          colors={[
            { color: "bg-base-900", name: "base-900" },
            { color: "bg-base-800", name: "base-800" },
            { color: "bg-base-700", name: "base-700" },
            { color: "bg-base-600", name: "base-600" },
            { color: "bg-base-500", name: "base-500" },
            { color: "bg-base-400", name: "base-400" },
            { color: "bg-base-300", name: "base-300" },
            { color: "bg-base-200", name: "base-200" },
            { color: "bg-base-100", name: "base-100" },
          ]}
        />
        <ColorList
          groupName="base-contrast"
          colors={[
            { color: "bg-base-contrast-20", name: "base-900" },
            { color: "bg-base-contrast-36", name: "base-900" },
            { color: "bg-base-contrast-54", name: "base-900" },
            { color: "bg-base-contrast-80", name: "base-900" },
            { color: "bg-base-contrast", name: "base-900" },
          ]}
        />
      </div>
      <div className="flex space-x-8">
        <ColorList
          groupName="primary"
          colors={[
            { color: "bg-primary-darken", name: "primary darken" },
            { color: "bg-primary", name: "primary" },
            { color: "bg-primary-light", name: "primary light" },
          ]}
        />

        <ColorList
          groupName="danger"
          colors={[
            { color: "bg-danger-darken", name: "danger darken" },
            { color: "bg-danger", name: "danger" },
            { color: "bg-danger-light", name: "danger light" },
          ]}
        />
        <ColorList
          groupName="success"
          colors={[
            { color: "bg-success-darken", name: "success darken" },
            { color: "bg-success", name: "success" },
            { color: "bg-success-light", name: "success light" },
          ]}
        />
      </div>
      <div className="flex space-x-8">
        <ColorList
          groupName="trade"
          colors={[
            { color: "bg-trade-loss", name: "trade loss" },
            { color: "bg-trade-profit", name: "trade profit" },
          ]}
        />
        <ColorList
          groupName="warning"
          colors={[{ color: "bg-warning", name: "warning" }]}
        />
        <ColorList
          groupName="link"
          colors={[{ color: "bg-link", name: "link" }]}
        />
      </div>
    </div>
  );
};

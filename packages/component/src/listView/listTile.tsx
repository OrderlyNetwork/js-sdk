import { FC, PropsWithChildren, useMemo } from "react";
import {
  NetworkImage,
  type NetworkImageProps,
  type NetworkImageType,
} from "@/icon/networkImage";
import { cn } from "@/utils/css";

// type avatarType

export interface ListTileProps {
  className?: string;
  tailing?: React.ReactNode;
  // leading?: React.ReactNode;
  avatar?: string | React.ReactNode | NetworkImageProps;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const ListTile: FC<PropsWithChildren<ListTileProps>> = (props) => {
  const leading = useMemo(() => {
    if (!props.avatar) {
      return null;
    }
    if (
      (typeof props.avatar === "object" &&
        (props.avatar as NetworkImageProps).type === "token") ||
      (props.avatar as NetworkImageProps).type === "chain"
    ) {
      return (
        <div className={"flex items-center"}>
          <NetworkImage {...(props.avatar as NetworkImageProps)} />
        </div>
      );
    }

    if (typeof props.avatar === "string") {
      return <img src={props.avatar} className={"w-10 h-10 rounded-full"} />;
    }
    return props.avatar as React.ReactNode;
  }, [[props.avatar]]);

  const children = useMemo(() => {
    if (props.title || props.subtitle) {
      return (
        <div className={"flex flex-col gap-1"}>
          {props.title && (
            <div key={"title"} className={"font-semibold"}>
              {props.title}
            </div>
          )}
          {props.subtitle && (
            <div key={"subtitle"} className={"text-3xs text-base-contrast-54"}>
              {props.subtitle}
            </div>
          )}
        </div>
      );
    }

    return props.children;
  }, [props.title, props.subtitle, props.children]);

  return (
    <div
      className={cn(
        "py-3 flex gap-3 hover:bg-base-200 active:bg-base-100",
        props.className,
        props.disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={props.onClick}
    >
      {leading}
      <div className={"flex-1"}>{children}</div>
      {props.tailing}
    </div>
  );
};

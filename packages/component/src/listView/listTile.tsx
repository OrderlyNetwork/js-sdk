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
      typeof props.avatar === "object" &&
      ((props.avatar as NetworkImageProps).type === "token" ||
        (props.avatar as NetworkImageProps).type === "chain")
    ) {
      return (
        <div className="orderly-flex orderly-items-center">
          <NetworkImage {...(props.avatar as NetworkImageProps)} />
        </div>
      );
    }

    if (typeof props.avatar === "string") {
      return (
        <img
          src={props.avatar}
          className="orderly-w-10 orderly-h-10 orderly-rounded-full"
        />
      );
    }
    return props.avatar as React.ReactNode;
  }, [[props.avatar]]);

  const children = useMemo(() => {
    if (props.title || props.subtitle) {
      return (
        <div className="orderly-flex orderly-flex-col orderly-gap-1">
          {props.title && (
            <div key={"title"} className="orderly-font-semibold">
              {props.title}
            </div>
          )}
          {props.subtitle && (
            <div
              key={"subtitle"}
              className="orderly-text-3xs desktop:orderly-text-2xs orderly-text-base-contrast-54"
            >
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
        "orderly-py-3 orderly-flex orderly-gap-3 active:orderly-bg-base-100",
        props.className,
        props.disabled && "orderly-opacity-60 orderly-cursor-not-allowed"
      )}
      onClick={props.onClick}
    >
      {leading}
      <div className="orderly-flex-1">{children}</div>
      {props.tailing}
    </div>
  );
};

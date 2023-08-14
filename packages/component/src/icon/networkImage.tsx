// https://oss.woo.network/static/network_logo/1.png
// network logo
import { cn } from "@/utils/css";
// import { cva } from "class-variance-authority";
import React, { FC, useEffect, useMemo } from "react";

type Size = "small" | "medium" | "large";

export type NetworkImageType = "coin" | "chain";

export interface NetworkImageProps {
  name: string;
  id?: string;
  size?: Size | number;
  backgroundColor?: string;
  className?: string;
  type: NetworkImageType;
}

// TODO: 添加icon生成adpater
export const NetworkImage: FC<NetworkImageProps> = (props) => {
  const [url, setUrl] = React.useState<string>();

  useEffect(() => {
    const img = new Image();

    img.onload = function () {
      setUrl(img.src);
    };

    img.onerror = function () {
      console.log("load icon error");
    };

    if (props.type === "coin") {
      // coin logos
      img.src = `https://oss.woo.network/static/symbol_logo/${props.name.toUpperCase()}.png`;
    }
    if (props.type === "chain") {
      img.src = `https://oss.woo.network/static/network_logo/${props.name.toUpperCase()}.png`;
    }

    // crypto logos
    // https://cryptologos.cc/logos/
    // img.src = `https://cryptologos.cc/logos/${props.name.toLowerCase()}-${props.size}.png?v=010`;
  }, []);

  const icon = useMemo(() => {
    if (!url) {
      return null;
    }
    return <img src={url} alt={props.name} />;
  }, [url]);

  const size = useMemo(() => {
    if (typeof props.size === "undefined") return "24px";
    if (props.size === "small") return "16px";
    if (props.size === "medium") return "24px";
    if (props.size === "large") return "32px";

    return `${props.size}px`;
  }, [props.size]);

  return (
    <div
      className={cn("inline-block", props.className)}
      style={{
        width: size,
        height: size,
        backgroundColor: props.backgroundColor,
      }}
    >
      {icon}
    </div>
  );
};
NetworkImage.displayName = "NetworkImage";

import { cn } from "@/utils/css";
import React, { FC, useEffect, useMemo } from "react";

type Size = "small" | "medium" | "large";

export interface CoinProps {
  name: string;
  size?: Size | number;
  backgroundColor?: string;
  className?: string;
}

// TODO: 添加icon生成adpater
export const Coin: FC<CoinProps> = (props) => {
  const [url, setUrl] = React.useState<string>();

  useEffect(() => {
    const img = new Image();

    img.onload = function () {
      setUrl(img.src);
    };

    img.onerror = function () {};

    // crypto logos
    // https://cryptologos.cc/logos/
    // img.src = `https://cryptologos.cc/logos/${props.name.toLowerCase()}-${props.size}.png?v=010`;
    img.src = `https://oss.woo.network/static/symbol_logo/${props.name.toUpperCase()}.png`;
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
      className={cn("orderly-inline-block", props.className)}
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

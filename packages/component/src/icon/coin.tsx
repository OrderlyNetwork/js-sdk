import React, { FC, useEffect, useMemo } from "react";

type Size = "small" | "medium" | "large";

export interface CoinProps {
  name: string;
  size?: Size | number;
}

export const Coin: FC<CoinProps> = (props) => {
  const [url, setUrl] = React.useState<string>();

  useEffect(() => {
    const img = new Image();

    img.onload = function () {
      setUrl(img.src);
    };

    // crypto logos
    // https://cryptologos.cc/logos/
    // img.src = `https://cryptologos.cc/logos/${props.name.toLowerCase()}-${props.size}.png?v=010`;
    img.src = `https://oss.woo.network/static/symbol_logo/${props.name.toLowerCase()}.png`;
  }, []);

  const icon = useMemo(() => {
    if (!url) {
      return null;
    }
    return <img src={url} alt={props.name} />;
  }, [url]);

  const size = useMemo(() => {
    return typeof props.size === "number" ? `${props.size}px` : props.size;
  }, [props.size]);

  return (
    <div className="inline-block" style={{ width: size, height: size }}>
      {icon}
    </div>
  );
};

import React, { FC, useEffect, useMemo, useState } from "react";

export interface LogoProps {
  link?: string;
  image: string;
  title?: string;
  size?: number;
}

export const Logo: FC<LogoProps> = ({
  link = "/",
  image,
  title,
  size = 50,
}) => {
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
    img.src = image;
  }, [image]);

  const logo = useMemo(() => {
    if (!url) {
      return null;
    }
    return <img src={url} alt={title} />;
  }, [url]);

  return (
    <div
      className="flex flex-row justify-center items-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <a href={link}>{logo}</a>
    </div>
  );
};

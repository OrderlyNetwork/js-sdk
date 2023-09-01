import React, { FC, useEffect, useMemo, useState } from "react";

export interface LogoProps {
  link?: string;
  image: string;
  title?: string;
}

export const Logo: FC<LogoProps> = ({ link = "/", image, title }) => {
  const [url, setUrl] = React.useState<string>();
  useEffect(() => {
    const img = new Image();

    img.onload = function () {
      console.log("load icon success");
      setUrl(img.src);
    };

    img.onerror = function () {
      console.log("load icon error");
    };

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
      style={{ width: "50px", height: "50px" }}
    >
      <a href={link}>{logo}</a>
    </div>
  );
};

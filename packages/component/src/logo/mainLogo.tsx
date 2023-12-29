import { OrderlyAppContext } from "@/provider/appProvider";
import { cn } from "@/utils/css";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLE } from "@orderly.network/types";
import React, { FC, useContext, useEffect, useMemo, useState } from "react";

export interface LogoProps {
  link?: string;
  // image: string;
  title?: string;
  size?: number;
}

export const MainLogo: FC<LogoProps> = ({
  link = "/",
  // image,
  title,
  size,
}) => {
  const matches = useMediaQuery(MEDIA_TABLE);

  const { appIcons } = useContext(OrderlyAppContext);

  if (!appIcons?.main?.img && !appIcons?.main?.component) return null;

  // const [url, setUrl] = React.useState<string>();

  const _size = useMemo(() => {
    if (typeof size === "number") {
      return size;
    }

    if (matches) {
      return 50;
    }

    return 48;
  }, [size]);

  const logoElement = useMemo(() => {
    if (appIcons?.main?.img) {
      return <img src={appIcons?.main?.img} height={_size} />;
    }
    return null;
  }, [appIcons?.main, _size]);

  if (appIcons?.main?.component) {
    return <>{appIcons.main.component}</>;
  }

  // if(matches){
  return (
    <div
      className={cn(
        "orderly-inline-flex orderly-flex-row orderly-justify-center orderly-items-center orderly-px-3",
        appIcons.main?.className
      )}
      style={{ height: `${_size}px` }}
    >
      <a href={link}>{logoElement}</a>
    </div>
  );
  // }
};

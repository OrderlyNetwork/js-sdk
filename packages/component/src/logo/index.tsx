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

export const Logo: FC<LogoProps> = ({
  link = "/",
  // image,
  title,
  size,
}) => {
  const matches = useMediaQuery(MEDIA_TABLE);

  const { appIcons } = useContext(OrderlyAppContext);

  if (!appIcons?.appBar?.img && !appIcons?.appBar?.component) return null;

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
    if (appIcons?.appBar?.img) {
      return <img src={appIcons?.appBar?.img} />;
    }
    return null;
  }, [appIcons?.appBar]);

  if (appIcons?.appBar?.component) {
    return <>{appIcons.appBar.component}</>;
  }

  // if(matches){
  return (
    <div
      className={cn(
        "orderly-inline-flex orderly-flex-row orderly-justify-center orderly-items-center orderly-px-3",
        appIcons.appBar?.className
      )}
      style={{ height: `${_size}px` }}
    >
      <a href={link}>{logoElement}</a>
    </div>
  );
  // }
};

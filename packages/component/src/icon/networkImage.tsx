import { cn } from "@/utils/css";
import React, { FC, useEffect, useMemo, useRef, useState, memo } from "react";
import { Size } from "./types";
import { getSize } from "./utils";
import { WalletIcon } from "./icons";

export type NetworkImageType =
  | "symbol"
  | "chain"
  | "token"
  | "placeholder"
  | "path"
  | "unknown"
  | "wallet";

export interface NetworkImageProps {
  name?: string;
  path?: string;
  id?: number;
  size?: Size | number;
  backgroundColor?: string;
  className?: string;
  rounded?: boolean;
  type: NetworkImageType;

  symbol?: string;
}

export const NetworkImage: FC<NetworkImageProps> = memo((props) => {
  const { rounded = true } = props;
  const [url, setUrl] = React.useState<string>();
  const [loading, setLoading] = useState(false);

  const [failed, setFailed] = useState(false);

  const [isPlaceholder, setIsPlacholder] = useState(
    () => props.type === "placeholder"
  );

  const currentUrl = useRef<string>();

  useEffect(() => {
    if (
      typeof props.type === "undefined" &&
      typeof props.symbol === "undefined"
    ) {
      throw new Error("NetworkImage must have a type or symbol");
    }

    if (props.type === "placeholder" || props.type === "unknown") {
      return;
    }

    const img = new Image();
    setLoading(true);

    img.onload = function () {
      if (currentUrl.current !== img.src) {
        return;
      }
      setUrl(img.src);
      setLoading(false);
      setFailed(false);
    };

    img.onerror = function () {
      // setIsPlacholder(true);
      setFailed(true);
      setLoading(false);
    };

    // if (props.type === "token") {
    // }

    try {
      if (props.type === "symbol" || props.type === "token") {
        let name = props.name;
        if (typeof props.symbol === "string") {
          const arr = props.symbol?.split("_");
          name = arr[1];
        }
        // coin logos
        img.src = `https://oss.orderly.network/static/symbol_logo/${name}.png`;
      }
      if (props.type === "chain") {
        img.src = `https://oss.orderly.network/static/network_logo/${props.id}.png`;
      }

      if (props.type === "wallet") {
        const split = props.name?.split(" ");
        const formatWalletName = split?.[0]?.toLowerCase();
        img.src = `https://oss.orderly.network/static/wallet_icon/${formatWalletName}.png`;
      }

      if (props.type === "path") {
        img.src = props.path!;
      }

      currentUrl.current = img.src;
    } catch (e) {
      setIsPlacholder(true);
    }
    // crypto logos
    // https://cryptologos.cc/logos/
    // img.src = `https://cryptologos.cc/logos/${props.name.toLowerCase()}-${props.size}.png?v=010`;
  }, [props.type, props.symbol, props.name, props.id]);

  const icon = useMemo(() => {
    // if (failed) {
    if (props.type === "unknown") {
      return (
        <span className="orderly-text-base-contrast/50 orderly-text-[10px]">
          U
        </span>
      );
    }
    // }
    if (!url) {
      return null;
    }

    return <img src={url} alt={props.name} />;
  }, [url, failed, props.type]);

  const size = useMemo(() => {
    return getSize(props.size);
  }, [props.size]);

  if (isPlaceholder) {
    return <WalletIcon size={20} />;
  }

  return (
    <div
      className={cn(
        "orderly-inline-flex orderly-overflow-hidden orderly-leading-none orderly-text-center orderly-items-center orderly-justify-center",
        (isPlaceholder || loading) && "orderly-bg-slate-200",
        rounded && "orderly-rounded-full",
        loading && "orderly-animate-pulse",
        (failed || props.type === "unknown") && "orderly-bg-base-100",
        props.className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: props.backgroundColor,
      }}
    >
      {icon}
    </div>
  );
});

NetworkImage.displayName = "NetworkImage";

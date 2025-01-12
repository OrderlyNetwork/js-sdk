import { FC, useEffect, useRef } from "react";
import {
  cn,
  CopyIcon,
  Flex,
  SimpleDialogFooter,
  SimpleDialogFooterProps,
  Text,
} from "@orderly.network/ui";
import { qrcode as qr } from "@akamfoad/qr";

import { MainLogo } from "../mainLogo";
import { UseQRCodeScriptReturn } from "./QRCode.script";

export type QRCodeProps = UseQRCodeScriptReturn & {
  close?: () => void;
};

export const QRCode: FC<QRCodeProps> = (props) => {
  if (props.loading) {
    return <Loading />;
  }

  if (props.confirm) {
    return (
      <ScanQRCode
        close={props.close}
        seconds={props.seconds}
        url={props.url}
        copyUrl={props.copyUrl}
      />
    );
  }

  return <LinkMobileDevice close={props.close} onConfirm={props.onConfirm} />;
};

type ScanQRCodeProps = Pick<QRCodeProps, "seconds" | "close" | "copyUrl"> & {
  url?: string;
};

const ScanQRCode: FC<ScanQRCodeProps> = (props) => {
  const actions: SimpleDialogFooterProps["actions"] = {
    primary: {
      label: "Ok",
      onClick: () => {
        props.close?.();
      },
      size: "md",
    },
  };

  return (
    <Flex direction="column" gapY={3}>
      <Text size="base" intensity={98}>
        Scan QR Code
      </Text>
      <Text
        size="2xs"
        intensity={54}
        weight="regular"
        className="oui-text-center"
      >
        {/* need to break the line by "/" */}
        Scan the QR code or paste the URL into another browser/{"\n"}device to
        continue.
      </Text>

      <Text size="sm" intensity={54}>
        Countdown: <Text.gradient color="brand">{props.seconds}s</Text.gradient>
      </Text>

      <Flex
        className={cn(
          "oui-w-[180px] oui-h-[180px] ",
          "oui-border oui-border-base-contrast-20 oui-rounded-2xl"
        )}
        justify="center"
        itemAlign="center"
      >
        <Flex
          className="oui-w-[160px] oui-h-[160px] oui-rounded-lg oui-bg-white"
          justify="center"
          itemAlign="center"
        >
          <QRCodeCanvas width={138} height={138} content={props.url} />
        </Flex>
      </Flex>

      <Flex
        direction="row"
        gap={1}
        className={cn(
          "oui-cursor-pointer",
          "oui-group oui-text-base-contrast-54 hover:oui-text-base-contrast"
        )}
        onClick={props.copyUrl}
      >
        <CopyIcon
          size={16}
          opacity={1}
          className="oui-text-base-contrast-54 group-hover:oui-text-base-contrast"
        />
        <Text size="2xs" weight="regular">
          Copy URL
        </Text>
      </Flex>

      <SimpleDialogFooter
        actions={actions}
        className="oui-w-full oui-p-0 !oui-pt-8"
      />
    </Flex>
  );
};

type QRCodeCanvasProps = {
  width: number;
  height: number;
  content?: string;
};

const QRCodeCanvas: FC<QRCodeCanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !props.content) return;

    const qrcode = qr(props.content);
    const width = props.width;
    const height = props.height;

    // var canvas = document.createElement("canvas");
    // canvasRef.current.width = width;
    // canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d")!;

    const cells = qrcode.modules!;

    const tileW = width / cells.length;
    const tileH = height / cells.length;

    for (let r = 0; r < cells.length; ++r) {
      const row = cells[r];
      for (let c = 0; c < row.length; ++c) {
        ctx.fillStyle = row[c] ? "#000" : "#fff";
        const w = Math.ceil((c + 1) * tileW) - Math.floor(c * tileW);
        const h = Math.ceil((r + 1) * tileH) - Math.floor(r * tileH);
        ctx.fillRect(Math.round(c * tileW), Math.round(r * tileH), w, h);
      }
    }
  }, [canvasRef, props.content]);

  return <canvas width={props.width} height={props.height} ref={canvasRef} />;
};

type LinkMobileDeviceProps = Pick<QRCodeProps, "close" | "onConfirm">;

const LinkMobileDevice: FC<LinkMobileDeviceProps> = (props) => {
  const actions: SimpleDialogFooterProps["actions"] = {
    secondary: {
      label: "Cancel",
      onClick: () => {
        props.close?.();
      },
      className: "oui-flex-1",
      size: "md",
    },
    primary: {
      label: "Confirm",
      onClick: props.onConfirm,
      className: "oui-flex-1",
      size: "md",
    },
  };

  return (
    <Flex direction="column">
      <MainLogo />
      <Text size="base" intensity={98} className="oui-mt-5">
        Link Mobile Device
      </Text>
      <Text
        size="2xs"
        intensity={54}
        weight="regular"
        className="oui-text-center oui-mt-3"
      >
        Open pro.woofi.com on your mobile device and scan the QR code to link
        this wallet. For security, the QR code will expire in 60 seconds. <br />
        The QR code allows mobile trading but does not enable withdrawals.
        Ensure you are not sharing your screen or any screenshots of the QR
        code.
      </Text>
      <SimpleDialogFooter
        actions={actions}
        className="oui-w-full oui-p-0 !oui-pt-8"
      />
    </Flex>
  );
};

const Loading = () => {
  return (
    <Flex direction="column" gap={5}>
      <Spinner />
      <Text size="sm" intensity={98}>
        Approve QR code with wallet...
      </Text>
    </Flex>
  );
};

const Spinner = () => {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="oui-animate-spin"
    >
      <path
        d="M11.4858 52.1631C10.4698 52.5965 9.28872 52.1259 8.91766 51.0855C7.68926 47.6412 7.04029 44.0121 7.00182 40.3463C6.95634 36.0129 7.76483 31.713 9.38113 27.6921C10.9974 23.6712 13.3899 20.0079 16.4219 16.9116C18.9868 14.2923 21.967 12.122 25.2375 10.4861C26.2253 9.99202 27.4035 10.4698 27.8369 11.4858L28.8571 13.8773C29.2904 14.8933 28.8139 16.0615 27.8336 16.5706C25.3569 17.8567 23.0959 19.5294 21.1375 21.5293C18.7119 24.0064 16.7979 26.9369 15.5049 30.1537C14.2119 33.3704 13.5651 36.8103 13.6015 40.277C13.6308 43.076 14.1051 45.8482 15.0026 48.4906C15.3579 49.5365 14.8933 50.7096 13.8773 51.143L11.4858 52.1631Z"
        fill="url(#paint0_linear_177_6754)"
      />
      <path
        d="M73 40C73 58.2254 58.2254 73 40 73C21.7746 73 7 58.2254 7 40C7 21.7746 21.7746 7 40 7C58.2254 7 73 21.7746 73 40ZM13.6 40C13.6 54.5803 25.4197 66.4 40 66.4C54.5803 66.4 66.4 54.5803 66.4 40C66.4 25.4197 54.5803 13.6 40 13.6C25.4197 13.6 13.6 25.4197 13.6 40Z"
        fill="white"
        fill-opacity="0.06"
      />
      <defs>
        <linearGradient
          id="paint0_linear_177_6754"
          x1="73"
          y1="40"
          x2="7"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
          <stop offset="1" stopColor="rgb(var(--oui-gradient-brand-start))" />
        </linearGradient>
      </defs>
    </svg>
  );
};

import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  PnLDisplayFormat,
  ReferralType,
  ShareOptions,
  SharePnLConfig,
} from "../../types/types";
import { getPnlInfo, getPnLPosterData, savePnlInfo } from "../utils/utils";
import { CloseIcon, Divider, Flex, toast } from "@orderly.network/ui";
import { Poster } from "../poster";
import { CarouselBackgroundImage } from "./carousel";
import { PnlFormatView } from "./pnlFormat";
import { ShareOption } from "./options";
import { Message } from "./message";
import { BottomButtons } from "./bottomBtns";
import { PosterRef } from "../poster/poster";

export const DesktopSharePnLContent: FC<{
  position: any;
  leverage: number | string;
  hide: any;
  baseDp?: number;
  quoteDp?: number;
  referral?: ReferralType;
  shareOptions: SharePnLConfig;
}> = (props) => {
  const { shareOptions } = props;
  const localPnlConfig = getPnlInfo();

  const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat>(
    localPnlConfig.pnlFormat
  );
  const [shareOption, setShareOption] = useState<Set<ShareOptions>>(
    new Set(localPnlConfig.options)
  );
  const [selectedSnap, setSelectedSnap] = useState(localPnlConfig.bgIndex);
  const [message, setMessage] = useState(localPnlConfig.message);
  const [check, setCheck] = useState(false);
  // const { shareOptions } = useTradingPageContext();
  const { backgroundImages, ...resetOptions } = shareOptions ?? {
    backgroundImages: [],
  };

  const [domain, setDomain] = useState("");

  const posterRef = useRef<PosterRef | null>(null);

  useEffect(() => {
    const currentDomain = window.location.hostname;
    setDomain(currentDomain);
  }, []);

  const curBgImg = useMemo(() => {
    return shareOptions?.backgroundImages[selectedSnap];
  }, [shareOptions?.backgroundImages, selectedSnap]);

  const posterData = getPnLPosterData(
    props.position,
    props.leverage,
    check ? message : "",
    domain,
    pnlFormat,
    shareOption,
    props.baseDp,
    props.quoteDp,
    props.referral
  );

  console.log("posterData is", posterData);
  

  const onCopy = () => {
    posterRef.current
      ?.copy()
      .then(() => {
        props.hide?.();
        toast.success("Image copied");
      })
      .catch((e: any) => {
        toast.error(() => {
          return (
            <div>
              <div>Copy failed</div>
              <div className="oui-text-2xs oui-max-w-[396px] oui-mt-2 oui-text-base-contrast-54">
                Browser version outdated, please update in order to copy image
                to clipboard.
              </div>
            </div>
          );
        });
      });
  };
  const onDownload = () => {
    posterRef.current?.download("Poster.png");
    props.hide?.();
  };

  const formats: PnLDisplayFormat[] = ["roi_pnl", "roi", "pnl"];
  const options: ShareOptions[] = [
    "openPrice",
    "markPrice",
    "openTime",
    "leverage",
    "quantity",
  ];

  savePnlInfo(pnlFormat, shareOption, selectedSnap, message);

  return (
    <div className="oui-h-full oui-flex oui-flex-col oui-relative oui-referral oui-bg-slate-900">
      <div className="oui-flex-1 oui-h-full oui-overflow-y-auto">
        <div className="oui-h-[422px] oui-mt-[36px]">
          <Flex itemAlign={"center"} justify={"center"}>
          <Poster
            // className="oui-mx-11"
            width={552}
            height={310}
            data={{
              backgroundImg: curBgImg,
              ...resetOptions,
              data: posterData,
            }}
            ratio={3}
            ref={posterRef}
          />
          </Flex>
          <CarouselBackgroundImage
            backgroundImages={shareOptions?.backgroundImages ?? []}
            selectedSnap={selectedSnap}
            setSelectedSnap={setSelectedSnap}
          />
        </div>

        <div className="oui-px-10">
          <div className="oui-mt-4">
            <div className="oui-text-lg oui-h-[26px]">PnL display format</div>
            <div className="oui-pt-4 oui-flex oui-justify-start oui-gap-3">
              {formats.map((e) => (
                <PnlFormatView
                  setPnlFormat={setPnlFormat}
                  type={e}
                  curType={pnlFormat}
                />
              ))}
            </div>
          </div>

          <Divider className="oui-pt-6 oui-border-white/10" />

          <div className="oui-mt-4">
            <div className="oui-text-lg oui-h-[26px]">
              Optional information to share
            </div>
            <div className="oui-mt-4 oui-flex oui-justify-start oui-gap-4">
              {options.map((item) => (
                <ShareOption
                  setShareOption={setShareOption}
                  type={item}
                  curType={shareOption}
                />
              ))}
            </div>
          </div>

          <Message
            message={message}
            setMessage={setMessage}
            check={check}
            setCheck={setCheck}
          />
        </div>
      </div>

      <BottomButtons onClickCopy={onCopy} onClickDownload={onDownload} />

      <button
        onClick={() => {
          props.hide();
        }}
        className="oui-absolute oui-top-0 oui-right-0 oui-w-[40px] oui-h-[40px] oui-flex oui-justify-center oui-items-center"
      >
        <CloseIcon size={12} className="oui-fill-base-contrast-54" />
      </button>
    </div>
  );
};

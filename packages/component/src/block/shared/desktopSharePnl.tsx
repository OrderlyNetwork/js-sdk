import { CloseIcon } from "@/icon";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PnLDisplayFormat, ShareOptions } from "./type";
import { Divider } from "@/divider";
import { Poster } from "../poster";
import { OrderlyAppContext } from "@/provider";
import {
  ReferralType,
  getPnLPosterData,
  getPnlInfo,
  savePnlInfo,
} from "./sharePnLUtils";
import { PosterRef } from "../poster/poster";
import { CarouselBackgroundImage } from "./desktop/carousel";
import { PnlFormatView } from "./desktop/pnlFormat";
import { ShareOption } from "./desktop/options";
import { BottomButtons } from "./desktop/bottomBtns";
import { Message } from "./desktop/message";
import { useTradingPageContext } from "@/page/trading/context/tradingPageContext";
import { ShareConfigProps } from "./shareConfigProps";

export const DesktopSharePnLContent: FC<{
  position: any;
  leverage: number | string;
  hide: any;
  baseDp?: number;
  quoteDp?: number;
  referral?: ReferralType;
  shareOptions: ShareConfigProps;
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
  const { backgroundImages, ...resetOptions } = shareOptions?.pnl ?? {
    backgroundImages: [],
  };

  const [domain, setDomain] = useState("");

  const posterRef = useRef<PosterRef | null>(null);

  useEffect(() => {
    const currentDomain = window.location.hostname;
    setDomain(currentDomain);
  }, []);

  const curBgImg = useMemo(() => {
    return shareOptions?.pnl.backgroundImages[selectedSnap];
  }, [shareOptions?.pnl.backgroundImages, selectedSnap]);

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

  const onCopy = () => {
    posterRef.current
      ?.copy()
      .then(() => {
        props.hide?.();
        toast.success("Image copied");
      })
      .catch((e) => {
        toast.error(() => {
          return (
            <div>
              <div>Copy failed</div>
              <div className="orderly-text-2xs orderly-max-w-[396px] orderly-mt-2 orderly-text-base-contrast-54">
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
    <div className="orderly-h-full orderly-flex orderly-flex-col orderly-relative orderly-referral">
      <div className="orderly-flex-1 orderly-h-full orderly-overflow-y-auto">
        <div className="orderly-h-[422px] orderly-mt-[36px]">
          <Poster
            className="orderly-mx-11"
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
          <CarouselBackgroundImage
            backgroundImages={shareOptions?.pnl.backgroundImages ?? []}
            selectedSnap={selectedSnap}
            setSelectedSnap={setSelectedSnap}
          />
        </div>

        <div className="orderly-px-10">
          <div className="orderly-mt-4">
            <div className="orderly-text-lg orderly-h-[26px]">
              PnL display format
            </div>
            <div className="orderly-pt-4 orderly-flex orderly-justify-start orderly-gap-3">
              {formats.map((e) => (
                <PnlFormatView
                  setPnlFormat={setPnlFormat}
                  type={e}
                  curType={pnlFormat}
                />
              ))}
            </div>
          </div>

          <Divider className="orderly-pt-6 orderly-border-white/10" />

          <div className="orderly-mt-4">
            <div className="orderly-text-lg orderly-h-[26px]">
              Optional information to share
            </div>
            <div className="orderly-mt-4 orderly-flex orderly-justify-start orderly-gap-4">
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
        className="orderly-absolute orderly-top-0 orderly-right-0 orderly-w-[40px] orderly-h-[40px] orderly-flex orderly-justify-center orderly-items-center"
      >
        <CloseIcon size={12} className="orderly-fill-base-contrast-54" />
      </button>
    </div>
  );
};

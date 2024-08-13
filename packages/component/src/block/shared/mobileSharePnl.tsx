import { cn } from "@/utils";
import { RadioIcon, CircleCheckIcon } from "@/icon";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/input";
import Button from "@/button";
import toast from "react-hot-toast";
import { PnLDisplayFormat, ShareOptions } from "./type";
import { Poster } from "../poster";
import { OrderlyAppContext } from "@/provider";
import { PosterRef } from "../poster/poster";
import { ReferralType, getPnLPosterData, getPnlInfo, savePnlInfo } from "./sharePnLUtils";
import {
  CarouselContent,
  CarouselItem,
  Dot,
  useCarousel,
} from "@/carousel/carousel";
import { Carousel } from "@/carousel";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTradingPageContext } from "@/page/trading/context/tradingPageContext";
import { ShareConfigProps } from "./shareConfigProps";

export const MobileSharePnLContent: FC<{
  position: any;
  leverage: any;
  hide: any;
  baseDp?: number;
  quoteDp?: number;
  referral?: ReferralType;
  shareOptions: ShareConfigProps;
}> = (props) => {
  const { shareOptions } = props;
  const localPnlConfig = getPnlInfo();

  const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat>(localPnlConfig.pnlFormat);
  const [shareOption, setShareOption] = useState<Set<ShareOptions>>(
    new Set(localPnlConfig.options)
  );
  const [message, setMessage] = useState<string>(localPnlConfig.message);
  const [selectIndex, setSelectIndex] = useState(localPnlConfig.bgIndex);
  // const { shareOptions } = useTradingPageContext();
  const { backgroundImages, ...resetOptions } = shareOptions?.pnl ?? { backgroundImages: []};

  const [domain, setDomain] = useState("");

  const posterRefs = shareOptions?.pnl.backgroundImages.map(() =>
    useRef<PosterRef | null>(null)
  );

  useEffect(() => {
    const currentDomain = window.location.hostname;
    setDomain(currentDomain);
  }, []);

  const posterData = getPnLPosterData(
    props.position,
    props.leverage,
    message,
    domain,
    pnlFormat,
    shareOption,
    props.baseDp,
    props.quoteDp,
    props.referral,
  );
  // console.log("pster data", posterData, props.position);

  const carouselRef = useRef<any>();
  const aspectRatio = 552 / 310;
  const [scale, setScale] = useState(1);
  const [carouselHeight, setCarouselHeight] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      const divWidth = carouselRef.current.offsetWidth;
      const divHeight = divWidth / aspectRatio;
      setCarouselHeight(divHeight);
      setScale(divWidth / 552);
    }
  }, [carouselRef, domain]);

  const onSharePnL = async (
    posterRef: React.MutableRefObject<PosterRef | null>
  ) => {
    if (!posterRef.current) return;
    const data = posterRef.current?.toDataURL();
    const blob = dataURItoBlob(data);
    try {
      // Check if the browser supports the share feature
      if (navigator.share) {
        await navigator.share({
          // title: "Share PnL",
          text: message,
          // url: imageUrl,
          files: [new File([blob], "image.png", { type: "image/png" })],
        });
        console.log("Image shared successfully!");
      } else {
        console.log("Share API is not supported in this browser.");
      }
      props.hide?.();
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  savePnlInfo(
    pnlFormat,
    shareOption,
    selectIndex,
    message,
  );

  return (
    <div className="orderly-referral">
      {/* <div>{`leverage: ${props.leverage}x`}</div> */}
      <div
        ref={carouselRef}
        className="orderly-w-full orderly-mt-4 orderly-overflow-hidden"
        style={{ height: `${carouselHeight + 20}px` }}
      >
        <Carousel
          className="orderly-w-full orderly-overflow-hidden"
          opts={{ align: "start" }}
          initIndex={selectIndex}
        >
          <CarouselContent style={{ height: `${carouselHeight}px` }}>
            {shareOptions?.pnl.backgroundImages.map((item, index) => (
              <CarouselItem key={index}>
                <Poster
                  className="orderly-transform orderly-origin-top-left"
                  style={{ scale: `${scale}` }}
                  width={552}
                  height={310}
                  data={{
                    backgroundImg: item,
                    ...resetOptions,
                    data: posterData,
                  }}
                  ratio={3}
                  ref={posterRefs?.[index]}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="orderly-mt-2 orderly-mb-1 orderly-flex orderly-justify-center">
            <MyIdentifier
              dotClassName="orderly-w-[16px] orderly-h-[4px] orderly-bg-base-300 orderly-dot-normal"
              dotActiveClassName="orderly-bg-primary orderly-w-[20px] orderly-dot-sel"
              setSelectIndex={setSelectIndex}
            />
          </div>
        </Carousel>
      </div>

      <div className="orderly-max-h-[200px] orderly-overflow-y-auto">
        <div className="orderly-mt-4">
          <div className="orderly-text-3xs orderly-text-base-contrast-54">
            PnL display format
          </div>
          <div className="orderly-pt-3 orderly-px-1 orderly-flex orderly-justify-between orderly-gap-3">
            <PnlFormatView
              setPnlFormat={setPnlFormat}
              type="roi_pnl"
              curType={pnlFormat}
            />
            <PnlFormatView
              setPnlFormat={setPnlFormat}
              type="roi"
              curType={pnlFormat}
            />
            <PnlFormatView
              setPnlFormat={setPnlFormat}
              type="pnl"
              curType={pnlFormat}
            />
          </div>
        </div>

        <div className="orderly-mt-3">
          <div className="orderly-text-3xs orderly-text-base-contrast-54 orderly-h-[18px]">
            Optional information to share
          </div>
          <div className="orderly-flex orderly-flex-wrap orderly-gap-3 orderly-mt-3">
            <ShareOption
              setShareOption={setShareOption}
              type="openPrice"
              curType={shareOption}
            />
            <ShareOption
              setShareOption={setShareOption}
              type="openTime"
              curType={shareOption}
            />
            <ShareOption
              setShareOption={setShareOption}
              type="leverage"
              curType={shareOption}
            />
            <ShareOption
              setShareOption={setShareOption}
              type="markPrice"
              curType={shareOption}
            />
            <ShareOption
              setShareOption={setShareOption}
              type="quantity"
              curType={shareOption}
            />
          </div>
        </div>

        <div className="orderly-mt-3 orderly-mb-8">
          <div className="orderly-text-3xs orderly-text-base-contrast-54 orderly-h-[18px]">
            Your message
          </div>
          <div className="orderly-mt-3 orderly-h-[48px] orderly-bg-base-600 orderly-mx-1">
            <Input
              placeholder="Max 25 characters"
              containerClassName="orderly-bg-transparent orderly-h-[48px]"
              value={message}
              autoFocus={false}
              onChange={(e) => {
                if (e.target.value.length > 25) {
                  toast.error("Maximum support of 25 characters");
                  return;
                }
                setMessage(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="orderly-pt-2">
        <Button
          fullWidth
          className="orderly-h-[40px] orderly-text-[16px]"
          onClick={() => {
            const ref = posterRefs?.[selectIndex];
            if (ref) {
              onSharePnL(ref);
            }
          }}
        >
          Share
        </Button>
      </div>
    </div>
  );
};

const PnlFormatView: FC<{
  type: PnLDisplayFormat;
  curType?: PnLDisplayFormat;
  setPnlFormat: any;
}> = (props) => {
  const { type, curType, setPnlFormat } = props;

  const text = useMemo(() => {
    switch (type) {
      case "roi_pnl":
        return "ROI & PnL";
      case "roi":
        return "ROI";
      case "pnl":
        return "PnL";
    }
  }, [type]);

  const isSelected = type === curType;

  return (
    <div
      className={cn(
        "orderly-shadow-lg orderly-rounded-lg orderly-h-[46px] orderly-flex-1 orderly-bg-base-400 hover:orderly-cursor-pointer orderly-flex orderly-items-center orderly-px-3 orderly-referral-shadow",
        isSelected && "orderly-bg-primary orderly-dot-sel"
      )}
      onClick={() => {
        setPnlFormat(type);
      }}
    >
      <div className="orderly-text-sm orderly-text-base-contrast">{text}</div>
      {/* {isSelected && <RadioIcon size={20} />} */}
    </div>
  );
};

const ShareOption: FC<{
  type: ShareOptions;
  curType: Set<ShareOptions>;
  setShareOption: any;
}> = (props) => {
  const { type, curType, setShareOption } = props;

  const text = useMemo(() => {
    switch (type) {
      case "openPrice":
        return "Open price";
      case "openTime":
        return "Opened at";
      case "markPrice":
        return "Mark price";
      case "quantity":
        return "Quantity";
      case "leverage":
        return "Leverage";
    }
  }, [type]);

  const isSelected = curType.has(type);

  return (
    <div
      className={cn(
        "orderly-shadow-lg orderly-rounded-lg orderly-h-[46px] orderly-mt-0 orderly-w-[calc(50%-6px)] orderly-bg-base-400 hover:orderly-cursor-pointer orderly-items-center orderly-flex orderly-p-3 orderly-referral-shadow"
      )}
      onClick={() => {
        // setPnlFormat(type);
        setShareOption((value: Set<ShareOptions>) => {
          const updateSet = new Set(value);
          if (isSelected) {
            updateSet.delete(type);
          } else {
            updateSet.add(type);
          }
          return updateSet;
        });
      }}
    >
      <div className="orderly-text-sm orderly-flex-1 orderly-text-base-contrast">
        {text}
      </div>
      {isSelected && <CircleCheckIcon size={20} />}
    </div>
  );
};
function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

const MyIdentifier: FC<{
  setSelectIndex: any;
  className?: string;
  dotClassName?: string;
  dotActiveClassName?: string;
  onClick?: (index: number) => void;
}> = (props) => {
  const { scrollSnaps, selectedIndex } = useCarousel();
  useEffect(() => {
    props.setSelectIndex(selectedIndex);
  }, [selectedIndex]);

  return (
    <div className={cn("orderly-flex orderly-gap-1")}>
      {scrollSnaps.map((_, index) => {
        return (
          <Dot
            key={index}
            index={index}
            active={index === selectedIndex}
            onClick={props.onClick}
            className={props.dotClassName}
            activeClassName={props.dotActiveClassName}
          />
        );
      })}
    </div>
  );
};

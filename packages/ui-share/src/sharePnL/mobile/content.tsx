import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Poster } from "../poster";
import { PosterRef } from "../poster/poster";
import {
  PnLDisplayFormat,
  ReferralType,
  ShareEntity,
  ShareOptions,
  SharePnLConfig,
} from "../../types/types";
import { getPnlInfo, getPnLPosterData, savePnlInfo } from "../utils/utils";
import {
  Box,
  Button,
  CloseCircleFillIcon,
  cn,
  Input,
  ScrollArea,
  toast,
} from "@orderly.network/ui";
import { Carousel } from "../carousel";
import {
  CarouselContent,
  CarouselItem,
  Dot,
  useCarousel,
} from "../carousel/carousel";

export const MobileSharePnLContent: FC<{
  entity: ShareEntity;
  leverage: any;
  hide: any;
  baseDp?: number;
  quoteDp?: number;
  referral?: ReferralType;
  shareOptions: SharePnLConfig;
}> = (props) => {
  const { shareOptions } = props;
  const localPnlConfig = getPnlInfo();

  const hasRoiAndPnl = props.entity.roi != null && props.entity.pnl != null;
  const formats: PnLDisplayFormat[] = hasRoiAndPnl
    ? ["roi_pnl", "roi", "pnl"]
    : props.entity.roi != null
    ? ["roi"]
    : props.entity.pnl != null
    ? ["pnl"]
    : [];

  const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat>(
    formats.length == 1 ? formats[0] : localPnlConfig.pnlFormat
  );
  const [shareOption, setShareOption] = useState<Set<ShareOptions>>(
    new Set(localPnlConfig.options)
  );
  const [message, setMessage] = useState<string>(localPnlConfig.message);
  const [selectIndex, setSelectIndex] = useState(localPnlConfig.bgIndex);
  // const { shareOptions } = useTradingPageContext();
  const { backgroundImages, ...resetOptions } = shareOptions ?? {
    backgroundImages: [],
  };

  const [domain, setDomain] = useState("");

  const posterRefs = shareOptions?.backgroundImages?.map(() =>
    useRef<PosterRef | null>(null)
  );

  useEffect(() => {
    const currentDomain = window.location.hostname;
    setDomain(currentDomain);
  }, []);

  const posterData = getPnLPosterData(
    props.entity,
    props.leverage,
    message,
    domain,
    pnlFormat,
    shareOption,
    props.baseDp,
    props.quoteDp,
    props.referral
  );
  // console.log("pster data", posterData, props.entity);

  const carouselRef = useRef<any>();
  const aspectRatio = 552 / 310;
  const [scale, setScale] = useState(1);
  const [carouselHeight, setCarouselHeight] = useState(0);

  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  savePnlInfo(pnlFormat, shareOption, selectIndex, message);

  return (
    <div className="oui-w-full">
      {/* <div>{`leverage: ${props.leverage}x`}</div> */}
      <div
        ref={carouselRef}
        className="oui-w-full oui-mt-4 oui-overflow-hidden"
        style={{ height: `${carouselHeight + 20}px` }}
      >
        <Carousel
          className="oui-w-full oui-overflow-hidden"
          opts={{ align: "start" }}
          initIndex={selectIndex}
        >
          <CarouselContent style={{ height: `${carouselHeight}px` }}>
            {shareOptions?.backgroundImages?.map((item, index) => (
              <CarouselItem key={index}>
                <Poster
                  className="oui-transform oui-origin-top-left"
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
          <div className="oui-mt-2 oui-mb-1 oui-flex oui-justify-center">
            <MyIdentifier
              dotClassName="oui-w-[16px] oui-h-[4px] oui-bg-base-300"
              dotActiveClassName="!oui-bg-primary-darken oui-w-[20px]"
              setSelectIndex={setSelectIndex}
            />
          </div>
        </Carousel>
      </div>

      {/* @ts-ignore */}
      <ScrollArea className="oui-max-h-[200px] oui-overflow-y-auto oui-custom-scrollbar">
        <div className="oui-mt-4">
          <div className="oui-text-3xs oui-text-base-contrast-54">
            PnL display format
          </div>
          <div className="oui-pt-3 oui-px-1 oui-justify-between oui-gap-3 oui-grid oui-grid-cols-3 oui-row-span-1">
            {formats.map((item) => (
              <PnlFormatView
                setPnlFormat={setPnlFormat}
                type={item}
                curType={pnlFormat}
              />
            ))}
          </div>
        </div>

        <div className="oui-mt-3">
          <div className="oui-text-3xs oui-text-base-contrast-54 oui-h-[18px]">
            Optional information to share
          </div>
          <div className="oui-flex oui-flex-wrap oui-gap-3 oui-mt-3">
            {props.entity.openPrice && (
              <ShareOption
                setShareOption={setShareOption}
                type="openPrice"
                curType={shareOption}
              />
            )}
            {props.entity.openTime && (
              <ShareOption
                setShareOption={setShareOption}
                type="openTime"
                curType={shareOption}
              />
            )}
            {props.leverage && (
              <ShareOption
                setShareOption={setShareOption}
                type="leverage"
                curType={shareOption}
              />
            )}
            {props.entity.markPrice && (
              <ShareOption
                setShareOption={setShareOption}
                type="markPrice"
                curType={shareOption}
              />
            )}
            {props.entity.quantity && (
              <ShareOption
                setShareOption={setShareOption}
                type="quantity"
                curType={shareOption}
              />
            )}
          </div>
        </div>

        <div className="oui-mt-3 oui-mb-8">
          <div className="oui-text-3xs oui-text-base-contrast-54 oui-h-[18px]">
            Your message
          </div>
          <div className="oui-mt-3 oui-h-[48px] oui-bg-base-600 oui-mx-1">
            <Input
              placeholder="Max 25 characters"
              containerClassName="oui-bg-transparent oui-h-[48px]"
              value={message}
              autoFocus={false}
              onChange={(e) => {
                if (e.target.value.length > 25) {
                  toast.error("Maximum support of 25 characters");
                  return;
                }
                setMessage(e.target.value);
              }}
              ref={inputRef}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              suffix={
                focus && (
                  <button
                    className="oui-mr-3 oui-cursor-pointer"
                    onMouseDown={(e) => {
                      console.log("set message to empty");

                      setMessage("");
                      setTimeout(() => {
                        inputRef.current?.focus();
                      }, 50);
                      e.stopPropagation();
                    }}
                  >
                    <CloseCircleFillIcon size={18} color="white" />
                  </button>
                )
              }
            />
          </div>
        </div>
      </ScrollArea>

      <div className="oui-pt-2">
        <Button
          fullWidth
          className="oui-h-[40px] oui-text-[16px]"
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

  console.log("pnl format", type, curType);

  const isSelected = type === curType;

  return (
    <div
      className={cn(
        "oui-shadow-lg oui-rounded-lg oui-h-[46px] oui-flex-1 oui-bg-base-4 hover:oui-cursor-pointer oui-flex oui-items-center oui-px-3 oui-referral-shadow",
        isSelected && "oui-bg-primary-darken oui-dot-sel"
      )}
      onClick={() => {
        setPnlFormat(type);
      }}
    >
      <div className="oui-text-sm oui-text-base-contrast">{text}</div>
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
        "oui-shadow-lg oui-rounded-lg oui-h-[46px] oui-mt-0 oui-w-[calc(50%-6px)] oui-bg-base-4 hover:oui-cursor-pointer oui-items-center oui-flex oui-p-3 oui-referral-shadow"
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
      <div className="oui-text-sm oui-flex-1 oui-text-base-contrast">
        {text}
      </div>
      {isSelected && <ChoicesFillIcon />}
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

  console.log("setSelectIndex is", selectedIndex);

  return (
    <div className={cn("oui-flex oui-gap-1")}>
      {scrollSnaps.map((_: any, index: number) => {
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

const ChoicesFillIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.01416 11.9989C2.01416 6.47589 6.49136 1.9989 12.0142 1.9989C17.5372 1.9989 22.0142 6.47589 22.0142 11.9989C22.0142 17.5219 17.5372 21.9989 12.0142 21.9989C6.49136 21.9989 2.01416 17.5219 2.01416 11.9989ZM16.9853 7.31211C17.2125 7.09537 17.5236 7 17.8218 7C18.1201 7 18.4312 7.09537 18.6583 7.31211C19.1139 7.74546 19.1139 8.47384 18.6583 8.9072L10.5077 16.675C10.0534 17.1083 9.28909 17.1083 8.83472 16.675L5.34077 13.3459C4.88641 12.9126 4.88641 12.1841 5.34077 11.7508C5.79631 11.3175 6.56057 11.3175 7.01493 11.7508L9.67122 14.2822L16.9853 7.31211Z"
        fill="white"
        fillOpacity="1"
      />
    </svg>
  );
};

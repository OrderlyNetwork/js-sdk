import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  PnLDisplayFormat,
  ReferralType,
  ShareEntity,
  ShareOptions,
  SharePnLConfig,
} from "../../types/types";
import { getPnlInfo, getPnLPosterData, savePnlInfo } from "../utils/utils";
import {
  CloseIcon,
  Divider,
  Flex,
  toast,
  Text,
  Box,
} from "@orderly.network/ui";
import { Poster } from "../poster";
import { CarouselBackgroundImage } from "./carousel";
import { PnlFormatView } from "./pnlFormat";
import { ShareOption } from "./options";
import { Message } from "./message";
import { BottomButtons } from "./bottomBtns";
import { PosterRef } from "../poster/poster";

export const DesktopSharePnLContent: FC<{
  entity: ShareEntity;
  leverage: number | string;
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
    return shareOptions?.backgroundImages?.[selectedSnap];
  }, [shareOptions?.backgroundImages, selectedSnap]);

  const posterData = getPnLPosterData(
    props.entity,
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

  
  // check if the entity has the option, like formats
  const options: ShareOptions[] = [
    ...(props.entity.openPrice ? ["openPrice"] as ShareOptions[] : []),
    ...(props.entity.markPrice ? ["markPrice"] as ShareOptions[] : []),
    ...(props.entity.openTime ? ["openTime"] as ShareOptions[] : []),
    ...(props.leverage ? ["leverage"] as ShareOptions[] : []),
    ...(props.entity.quantity ? ["quantity"] as ShareOptions[] : []),
  ];

  savePnlInfo(pnlFormat, shareOption, selectedSnap, message);

  return (
    <div className="oui-h-full oui-flex oui-flex-col oui-relative oui-w-full">
      <div className="oui-flex-1 oui-h-full oui-overflow-y-auto">
        <Box mt={9} height={422}>
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
        </Box>

        <Flex
          direction={"column"}
          px={10}
          mt={6}
          justify={"start"}
          itemAlign={"start"}
          width={"100%"}
        >
          <Text size="sm" intensity={80}>
            PnL display format
          </Text>
          <Flex pt={3} gap={3} itemAlign={"center"}>
            {formats.map((e, index) => (
              <PnlFormatView
                key={index}
                setPnlFormat={setPnlFormat}
                type={e}
                curType={pnlFormat}
              />
            ))}
          </Flex>

          <Divider className="oui-w-full oui-pt-6 oui-border-white/10" />

          <Flex
            mt={6}
            direction={"column"}
            justify={"start"}
            itemAlign={"start"}
          >
            <Text size="sm" intensity={80}>
              Optional information to share
            </Text>
            <Flex mt={3} gap={4}>
              {options.map((item, index) => (
                <ShareOption
                  key={index}
                  setShareOption={setShareOption}
                  type={item}
                  curType={shareOption}
                />
              ))}
            </Flex>
          </Flex>

          <Message
            message={message}
            setMessage={setMessage}
            check={check}
            setCheck={setCheck}
          />
        </Flex>
      </div>

      <BottomButtons onClickCopy={onCopy} onClickDownload={onDownload} />

      {/* <button
        onClick={() => {
          props.hide();
        }}
        className="oui-absolute oui-top-0 oui-right-0 oui-w-[40px] oui-h-[40px] oui-flex oui-justify-center oui-items-center"
      >
        <CloseIcon size={12} className="oui-fill-base-contrast-54" />
      </button> */}
    </div>
  );
};

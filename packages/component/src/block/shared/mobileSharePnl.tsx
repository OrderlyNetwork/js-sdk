import { cn } from "@/utils";
import { RadioIcon, CircleCheckIcon } from "@/icon";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/input";
import Button from "@/button";
import toast from "react-hot-toast";
import { PnLDisplayFormat, ShareOptions } from "./type";
import { Poster } from "../poster";
import { OrderlyContext } from "@orderly.network/hooks";
import { OrderlyAppContext } from "@/provider";
import { PosterRef } from "../poster/poster";
import { getPnLPosterData } from "./sharePnLUtils";
import { Carousel } from "@/carousel";
import useEmblaCarousel from "embla-carousel-react";



export const MobileSharePnLContent: FC<{ position: any, leverage: any }> = (props) => {


    const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat>("roi_pnl");
    const [shareOption, setShareOption] = useState<Set<ShareOptions>>(new Set(["openPrice", "openTime", "markPrice", "quantity", "leverage"]));
    const [message, setMessage] = useState("");
    const { shareOptions } = useContext(OrderlyAppContext);

    const [domain, setDomain] = useState("");

    const posterRefs = shareOptions.pnl.backgroundImages.map(() => useRef<PosterRef | null>(null));

    useEffect(() => {
        const currentDomain = window.location.hostname;
        setDomain(currentDomain);
    }, []);


    const posterData = getPnLPosterData(props.position, props.leverage, message, domain, pnlFormat, shareOption);

    const carouselRef = useRef<any>();
    const aspectRatio = 552 / 310;
    const [scale, setScale] = useState(1);
    const [carouselHeight, setCarouselHeight] = useState(0);

    const [emblaRef, emblaApi] = useEmblaCarousel();

    useEffect(() => {
        if (carouselRef.current) {
            const divWidth = carouselRef.current.offsetWidth;
            const divHeight = divWidth / aspectRatio;
            setCarouselHeight(divHeight);
            setScale(divWidth / 552);
        }
    }, [carouselRef]);

    useEffect(() => {
        if (!emblaApi) return;

        function onSelect() {
            console.log("on selected",emblaApi?.selectedScrollSnap());
            
        }

        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)
    }, [emblaApi]);

    const onSharePnL = async (posterRef: React.MutableRefObject<PosterRef | null>) => {
        if (!posterRef.current) return;
        const data = posterRef.current?.toDataURL();
        const blob = dataURItoBlob(data);
        try {
            // 检查浏览器是否支持分享功能
            if (navigator.share) {
                await navigator.share({
                    title: 'Share PnL',
                    text: message,
                    // url: imageUrl,
                    files: [new File([blob], 'image.png', { type: 'image/png' })],
                });
                console.log('Image shared successfully!');
            } else {
                console.log('Share API is not supported in this browser.');
            }
        } catch (error) {
            console.error('Error sharing image:', error);
        }
    };

    

    return (
        <div className="orderly-p-0">
            <div
                ref={carouselRef}
                className="orderly-w-full orderly-mt-4 orderly-overflow-hidden"
                style={{ height: `${carouselHeight}px` }}
            >

                <Carousel opts={{ align: "start" }} ref={emblaRef}>
                    <Carousel.Content >
                        {shareOptions.pnl.backgroundImages.map((item, index) => (
                            <Carousel.Item key={index}>
                                <Poster
                                    className="orderly-transform orderly-origin-top-left"
                                    style={{ scale: `${scale}` }}
                                    width={552}
                                    height={310}
                                    data={{
                                        backgroundImg: item,
                                        color: "rgba(255, 255, 255, 0.98)",
                                        profitColor: "rgb(0,181,159)",
                                        loseColor: "rgb(255,103,194)",
                                        brandColor: "rgb(0,181,159)",
                                        data: posterData,
                                        layout: {}
                                    }}
                                    ref={posterRefs[index]}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel.Content>
                </Carousel>

            </div>


            <div className="orderly-max-h-[200px] orderly-overflow-y-auto">
                <div className="orderly-mt-4">
                    <div className="orderly-text-3xs orderly-text-base-contrast-54">PnL display format</div>
                    <div className="orderly-pt-3 orderly-flex orderly-justify-between orderly-gap-3">
                        <PnlFormatView setPnlFormat={setPnlFormat} type="roi_pnl" curType={pnlFormat} />
                        <PnlFormatView setPnlFormat={setPnlFormat} type="roi" curType={pnlFormat} />
                        <PnlFormatView setPnlFormat={setPnlFormat} type="pnl" curType={pnlFormat} />
                    </div>
                </div>

                <div className="orderly-mt-3">
                    <div className="orderly-text-3xs orderly-text-base-contrast-54 orderly-h-[18px]">Optional information to share</div>
                    <div className="orderly-flex orderly-flex-wrap orderly-gap-3 orderly-mt-3">
                        <ShareOption setShareOption={setShareOption} type="openPrice" curType={shareOption} />
                        <ShareOption setShareOption={setShareOption} type="openTime" curType={shareOption} />
                        <ShareOption setShareOption={setShareOption} type="leverage" curType={shareOption} />
                        <ShareOption setShareOption={setShareOption} type="markPrice" curType={shareOption} />
                        <ShareOption setShareOption={setShareOption} type="quantity" curType={shareOption} />
                    </div>
                </div>


                <div className="orderly-mt-3 orderly-mb-8">
                    <div className="orderly-text-3xs orderly-text-base-contrast-54 orderly-h-[18px]">Your message</div>
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

            <Button
                fullWidth
                className="orderly-h-[40px]"
                onClick={() => {

                    if (!emblaApi)return;
                    const index = emblaApi?.selectedScrollSnap();
                    console.log("index is", index);
                    
                    onSharePnL(posterRefs[index]);

                }}>
                Share
            </Button>

        </div>
    )
}

const PnlFormatView: FC<{
    type: PnLDisplayFormat,
    curType?: PnLDisplayFormat,
    setPnlFormat: any,
}> = (props) => {

    const { type, curType, setPnlFormat } = props;

    const text = useMemo(() => {
        switch (type) {
            case "roi_pnl": return "ROI & PnL";
            case "roi": return "ROI";
            case "pnl": return "PnL";
        }
    }, [type]);

    const isSelected = type === curType;

    return (<div
        className={cn("orderly-shadow-lg orderly-rounded-lg orderly-h-[48px] orderly-flex-1 orderly-bg-base-400 hover:orderly-cursor-pointer orderly-items-center orderly-flex orderly-p-3", isSelected && "orderly-border orderly-border-primary")}
        onClick={() => {
            setPnlFormat(type);
        }}
    >
        <div className="orderly-text-sm orderly-flex-1 orderly-text-base-contrast">{text}</div>
        {isSelected && <RadioIcon size={20} />}
    </div>);
}

const ShareOption: FC<{
    type: ShareOptions,
    curType: Set<ShareOptions>,
    setShareOption: any,
}> = (props) => {

    const { type, curType, setShareOption } = props;

    const text = useMemo(() => {
        switch (type) {
            case "openPrice": return "Open Price";
            case "openTime": return "Opened At";
            case "markPrice": return "Mark Price";
            case "quantity": return "Quantity";
            case "leverage": return "Leverage";
        }
    }, [type]);

    const isSelected = curType.has(type);

    return (<div
        className={cn("orderly-shadow-lg orderly-rounded-lg orderly-h-[48px] orderly-mt-0 orderly-w-[calc(50%-6px)] orderly-bg-base-400 hover:orderly-cursor-pointer orderly-items-center orderly-flex orderly-p-3")}
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
            })
        }}
    >
        <div className="orderly-text-sm orderly-flex-1 orderly-text-base-contrast">{text}</div>
        {isSelected && <CircleCheckIcon size={20} />}
    </div>);
}// 将 base64 图片数据转换为 Blob 对象
function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}
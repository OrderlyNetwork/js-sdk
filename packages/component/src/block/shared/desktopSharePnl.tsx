import { cn } from "@/utils";
import { ArrowDownToLineIcon, CircleCloseIcon, CopyDesktopIcon } from "@/icon";
import { FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/input";
import toast from "react-hot-toast";
import { PnLDisplayFormat, ShareOptions } from "./type";
import { Circle } from "lucide-react";
import { Divider } from "@/divider";
import { Checkbox } from "@/checkbox";
import { Poster } from "../poster";
import useEmblaCarousel from "embla-carousel-react";
import { OrderlyAppContext } from "@/provider";
import { getPnLPosterData } from "./sharePnLUtils";
import Button from "@/button";
import { PosterRef } from "../poster/poster";


export const DesktopSharePnLContent: FC<{
    position: any,
    leverage: number,
    hide: any,
    baseDp?: number,
    quoteDp?: number,
}> = (props) => {
    const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat>("roi_pnl");
    const [shareOption, setShareOption] = useState<Set<ShareOptions>>(new Set(["openPrice", "openTime", "markPrice", "quantity", "leverage"]));
    const [message, setMessage] = useState("");
    const [check, setCheck] = useState(false);
    const { shareOptions } = useContext(OrderlyAppContext);
    const [selectedSnap, setSelectedSnap] = useState(0);
    const [domain, setDomain] = useState("");

    const posterRef = useRef<PosterRef | null>(null);

    useEffect(() => {
        const currentDomain = window.location.hostname;
        setDomain(currentDomain);
    }, []);

    const curBgImg = useMemo(() => {
        return shareOptions.pnl.backgroundImages[selectedSnap];
    }, [shareOptions.pnl.backgroundImages, selectedSnap]);

    const posterData = getPnLPosterData(props.position, props.leverage, check ? message : "", domain, pnlFormat, shareOption, props.baseDp, props.quoteDp);

    const onCopy = () => {
        posterRef.current?.copy().then(() => {
            props.hide?.();
            toast.success("Image copied");
        }).catch((e) => {
            toast.error(() => {
                return (<div>
                    <div>Copy failed</div>
                    <div className="orderly-text-2xs orderly-max-w-[396px] orderly-mt-2 orderly-text-base-contrast-54">Browser version outdated, please update in order to copy image to clipboard.</div>
                </div>);
            });
        });
        
    };
    const onDownload = () => {
        posterRef.current?.download("Poster.png");
        props.hide?.();
    };

    return (
        <div className="orderly-h-full orderly-flex orderly-flex-col">
            <div className="orderly-flex-1 orderly-h-full orderly-overflow-y-auto">
                <div className="orderly-h-[422px] orderly-mt-9">
                    <Poster className="orderly-mx-11" width={552} height={310} data={{
                        backgroundImg: curBgImg,
                        color: "rgba(255, 255, 255, 0.98)",
                        profitColor: "rgb(0,181,159)",
                        loseColor: "rgb(255,103,194)",
                        brandColor: "rgb(0,181,159)",
                        data: posterData,
                        layout: {}
                    }} ref={posterRef} />
                    <CarouselBackgroundImage
                        backgroundImages={shareOptions.pnl.backgroundImages}
                        selectedSnap={selectedSnap}
                        setSelectedSnap={setSelectedSnap}
                    />
                </div>


                <div className="orderly-px-10">
                    <div className="orderly-mt-4">
                        <div className="orderly-text-lg orderly-h-[26px]">PnL display format</div>
                        <div className="orderly-pt-4 orderly-flex orderly-justify-start orderly-gap-3">
                            <PnlFormatView setPnlFormat={setPnlFormat} type="roi_pnl" curType={pnlFormat} />
                            <PnlFormatView setPnlFormat={setPnlFormat} type="roi" curType={pnlFormat} />
                            <PnlFormatView setPnlFormat={setPnlFormat} type="pnl" curType={pnlFormat} />
                        </div>
                    </div>

                    <Divider className="orderly-pt-6 orderly-border-white/10" />

                    <div className="orderly-mt-4">
                        <div className="orderly-text-lg orderly-h-[26px]">Optional information to share</div>
                        <div className="orderly-mt-4 orderly-flex orderly-justify-start orderly-gap-4">
                            <ShareOption setShareOption={setShareOption} type="openPrice" curType={shareOption} />
                            <ShareOption setShareOption={setShareOption} type="markPrice" curType={shareOption} />
                            <ShareOption setShareOption={setShareOption} type="openTime" curType={shareOption} />
                            <ShareOption setShareOption={setShareOption} type="leverage" curType={shareOption} />
                            <ShareOption setShareOption={setShareOption} type="quantity" curType={shareOption} />
                        </div>
                    </div>



                    <Message message={message} setMessage={setMessage} check={check} setCheck={setCheck} />
                </div>
            </div>

            <BottomButtons onClickCopy={onCopy} onClickDownload={onDownload} />

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

    let clsName =
        "orderly-flex orderly-items-center orderly-gap-1 orderly-cursor-pointer";
    if (isSelected) {
        clsName += " orderly-text-base-contrast";
    } else {
        clsName += "";
    }

    return (
        <div
            className={clsName}
            onClick={() => {
                setPnlFormat(type);
            }}
        >
            <button
                type="button"
                className="orderly-order-entry-radio-button orderly-w-[14px] orderly-h-[14px] orderly-rounded-full orderly-border-2 orderly-border-base-contrast-20"
            >
                {isSelected && (
                    // @ts-ignore
                    <Circle className="orderly-order-entry-radio-circle orderly-w-[10px] orderly-h-[10px] orderly-text-link orderly-bg-link orderly-rounded-full" />
                )}
            </button>
            <span className={cn("orderly-text-3xs orderly-ml-2 orderly-text-base-contrast-54", isSelected && "orderly-text-base-contrast")}>{text}</span>
        </div>
    );
}

const ShareOption: FC<{
    type: ShareOptions,
    curType: Set<ShareOptions>,
    setShareOption: any,
}> = (props) => {

    const { type, curType, setShareOption } = props;

    const text = useMemo(() => {
        switch (type) {
            case "openPrice": return "Open price";
            case "openTime": return "Opened at";
            case "markPrice": return "Mark price";
            case "quantity": return "Quantity";
            case "leverage": return "Leverage";
        }
    }, [type]);

    const isSelected = curType.has(type);

    return (<div
        className={cn("orderly-h-[20px] hover:orderly-cursor-pointer orderly-items-center orderly-flex")}
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

        <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
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
        />

        <div className="orderly-text-sm orderly-text-base-contrast-54 orderly-pl-1">{text}</div>

    </div>);
}

const Message: FC<{
    message: string,
    setMessage: any,
    check: boolean,
    setCheck: any,
}> = (props) => {

    const { message, setMessage, check, setCheck } = props;
    const [focus, setFocus] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    return (
        <div className="orderly-mt-4 orderly-mb-7 orderly-flex orderly-items-center">
            <Checkbox checked={check} onCheckedChange={(e: boolean) => {
                setCheck(e);
            }} />
            <div
                className="orderly-text-xs orderly-text-base-contrast-54 orderly-ml-2 hover:orderly-cursor-pointer"
                onClick={() => {
                    setCheck(!props.check);
                }}
            >
                Your message
            </div>
            <div className="orderly-bg-base-900 orderly-mx-2 orderly-rounded-sm">
                <Input
                    ref={inputRef}
                    placeholder="Max 25 characters"
                    containerClassName="orderly-bg-transparent orderly-h-[32px] orderly-w-[295px]"
                    value={message}
                    autoFocus={false}
                    suffix={focus && (<button className="orderly-mr-3 orderly-cursor-pointer" onMouseDown={(e) => {
                        console.log("set message to empty");


                        setMessage("");
                        setTimeout(() => {
                            inputRef.current?.focus();
                        }, 50);
                        e.stopPropagation();
                    }}>
                        <CircleCloseIcon size={18} />
                    </button>)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    onChange={(e) => {
                        if (e.target.value.length > 25) {
                            toast.error("Maximum support of 25 characters");
                            return;
                        }
                        setCheck(e.target.value.length > 0);
                        setMessage(e.target.value);
                    }}
                />
            </div>
        </div>
    );
}


const BottomButtons: FC<{
    onClickDownload: any,
    onClickCopy: any,
}> = (props) => {
    const { onClickDownload, onClickCopy } = props;

    return (
        <div className="orderly-h-[76px] orderly-bg-base-900 orderly-flex orderly-gap-3 orderly-items-center orderly-justify-center">

            <Button
                color={"tertiary"}
                className="orderly-w-[188px]"
                onClick={onClickDownload}
            >
                <span>
                    <ArrowDownToLineIcon size={15} />
                </span>
                Download
            </Button>

            <Button
                className="orderly-w-[188px]"
                onClick={onClickCopy}
            >
                <span>
                    <CopyDesktopIcon size={15} />
                </span>
                Copy
            </Button>
        </div>
    );
}


const CarouselBackgroundImage: FC<{
    backgroundImages: string[],
    selectedSnap: number,
    setSelectedSnap: any,
}> = (props) => {
    const {
        backgroundImages,
        selectedSnap,
        setSelectedSnap
    } = props;


    const [emblaRef, emblaApi] = useEmblaCarousel({
        // loop: true,
        containScroll: "keepSnaps",
        dragFree: true
    });

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
    }, [emblaApi]);

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback((emblaApi: any) => {
        // setPrevBtnDisabled(!emblaApi.canScrollPrev());
        // setNextBtnDisabled(!emblaApi.canScrollNext());
        setSelectedSnap(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return

        onSelect(emblaApi)
        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)
    }, [emblaApi, onSelect]);


    return (
        <div className="orderly-flex orderly-px-[10px] orderly-mt-5">
            <PrevButton onClick={onPrevButtonClick} />
            <div ref={emblaRef} className="orderly-w-[552px] orderly-h-[92px] orderly-overflow orderly-overflow-x-auto orderly-mx-2">
                <div className="orderly-flex">
                    {backgroundImages.map((e, index) =>
                    (<div
                        key={e}
                        onClick={() => {
                            console.log("scroll to", index);

                            emblaApi?.scrollTo(index);
                        }}
                        className={cn("orderly-shrink-0 orderly-mx-2 orderly-w-[162px] orderly-h-[92px] orderly-rounded-sm",
                            selectedSnap === index && "orderly-border orderly-border-primary")}

                    >
                        <img src={e} className="orderly-rounded-sm" />
                    </div>)
                    )}
                </div>
            </div>
            <NextButton onClick={onNextButtonClick} />
        </div>
    );
}


type PropType = PropsWithChildren<
    React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
>

const PrevButton: FC<PropType> = (props) => {
    const { children, ...restProps } = props

    return (
        <button {...restProps}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="#333948" />
                <path d="M15.4285 6.49199L10.3425 12L15.4285 17.508L13.8627 19.2L7.19989 12L13.8627 4.79999L15.4285 6.49199Z" fill="#868F99" />
            </svg>
        </button>
    );
}

const NextButton: FC<PropType> = (props) => {
    const { children, ...restProps } = props

    return (
        <button {...restProps}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="#333948" />
                <path d="M8.57397 17.508L13.6599 12L8.57398 6.49198L10.1397 4.79998L16.8025 12L10.1397 19.2L8.57397 17.508Z" fill="#868F99" />
            </svg>
        </button>
    );
}
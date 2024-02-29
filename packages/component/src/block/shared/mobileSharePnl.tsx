import { cn } from "@/utils";
import { RadioIcon, CircleCheckIcon } from "@/icon";
import { FC, useMemo, useState } from "react"
import { Input } from "@/input";
import Button from "@/button";
import toast from "react-hot-toast";
import { PnLDisplayFormat, ShareOptions } from "./type";
import { Poster } from "../poster";


export const MobileSharePnLContent: FC<{ position: any, snapshot: any }> = (props) => {


    const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat | undefined>("roi_pnl");
    const [shareOption, setShareOption] = useState<Set<ShareOptions>>(new Set(["openPrice", "openTime", "markPrice", "quantity", "leverage"]));
    const [message, setMessage] = useState("");

    const onSharePnL = async () => {

        var data = { ...props.snapshot, message };
        if (pnlFormat === "roi") {
            delete data["pnl"];
        } else if (pnlFormat === "pnl") {
            delete data["roi"];
        }

        if (!shareOption.has("openTime")) {
            delete data["openTime"];
        }
        if (!shareOption.has("openTime")) {
            delete data["openTime"];
        }
        if (!shareOption.has("markPrice")) {
            delete data["markPrice"];
        }
        if (!shareOption.has("quantity")) {
            delete data["quantity"];
        }
        if (!shareOption.has("leverage")) {
            delete data["leverage"];
        }


        try {
            // 获取要分享的图片 URL
            const imageUrl = 'https://example.com/image.jpg';

            // 检查浏览器是否支持分享功能
            if (navigator.share) {
                await navigator.share({
                    title: 'Share Image',
                    text: 'Check out this image!',
                    url: imageUrl,
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
            <div className="orderly-h-[192px] orderly-mt-4">

            <Poster
                    
                    width={343}
                    height={192}
                    data={{
                        backgroundImg: "/images/poster_bg.png",
                        color: "rgba(255, 255, 255, 0.98)",
                        profitColor: "rgb(0,181,159)",
                        loseColor: "rgb(255,103,194)",
                        brandColor: "rgb(0,181,159)",
                        data: {
                            message: "I am the WOO KING.",
                            domain: "dex.woo.org",
                            updateTime: "2022-JAN-01 23:23",
                            position: {
                                symbol: "WOO-PERP",
                                currency: "USDC",
                                side: "LONG",
                                leverage: 20,
                                pnl: 10432.23,
                                ROI: 20.25,
                                informations: [
                                    { title: "Open Price", value: "0.12313" },
                                    { title: "Opened at", value: "Jan-01 23:23" },
                                    { title: "Mark price", value: "0.12341" },
                                    { title: "Quantity", value: "0.123" },
                                ],
                            },
                        },
                        layout: {}
                    }}
                />

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
                onClick={onSharePnL}>
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
}
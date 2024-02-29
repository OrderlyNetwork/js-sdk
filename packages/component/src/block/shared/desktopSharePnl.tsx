import { cn } from "@/utils";
import { DownloadIcon } from "@/icon";
import { FC, useMemo, useState } from "react"
import { Input } from "@/input";
import toast from "react-hot-toast";
import { PnLDisplayFormat, ShareOptions } from "./type";
import { Circle } from "lucide-react";
import { Divider } from "@/divider";
import { Checkbox } from "@/checkbox";
import { ShareFacebookIcon, ShareRadditIcon, ShareTelegramIcon, ShareXIcon } from "./shareIcons";


export const DesktopSharePnLContent: FC<{ position: any, snapshot: any }> = (props) => {


    const [pnlFormat, setPnlFormat] = useState<PnLDisplayFormat | undefined>("roi_pnl");
    const [shareOption, setShareOption] = useState<Set<ShareOptions>>(new Set(["openPrice", "openTime", "markPrice", "quantity", "leverage"]));
    const [message, setMessage] = useState("");
    const [check, setCheck] = useState(false);

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

        if (!check && data.keys.includes("message")) {
            delete data["message"];
        }

        console.log("share data", data);


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
        <div className="orderly-p-0 orderly-align-bottom">
            <div className="orderly-h-[422px] orderly-bg-white/50 orderly-mt-9"></div>


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



                <Message message={message} setMessage={setMessage} check={check} setCheck={setCheck}/>
            </div>

            <BottomButtons />

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
            <span className="orderly-text-3xs">{text}</span>
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
            case "openPrice": return "Open Price";
            case "openTime": return "Opened At";
            case "markPrice": return "Mark Price";
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

    return (
        <div className="orderly-mt-4 orderly-mb-7 orderly-flex orderly-items-center">
            <Checkbox checked={check} onCheckedChange={(e: boolean) => {
                setCheck(e);
            }} />
            <div className="orderly-text-xs orderly-text-base-contrast-54 orderly-ml-2">Your message</div>
            <div className="orderly-bg-base-900 orderly-mx-2 orderly-rounded-sm">
                <Input
                    placeholder="Max 25 characters"
                    containerClassName="orderly-bg-transparent orderly-h-[32px] orderly-w-[295px]"
                    value={message}
                    autoFocus={false}
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


const BottomButtons: FC = (props) => {

    function getCanvasElement() {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const context = canvas.getContext('2d');

        if (context) {
            context.fillStyle = 'red';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        return canvas;
    }

    function saveCanvasImage(canvas: HTMLCanvasElement, fileName: string) {
        const imageType = 'image/png'; // 或者 'image/jpeg'
        const imageData = canvas.toDataURL(imageType);
        const link = document.createElement('a');
        link.href = imageData;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function shareCanvasImageOnTwitter(canvas: HTMLCanvasElement, text: string) {
        const imageType = 'image/png'; // 或者 'image/jpeg'
        const imageData = canvas.toDataURL(imageType);
        const imgUrl = encodeURIComponent("https://twitter.com/Dior/status/1762583388895293868/photo/1");
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${imgUrl}`;
        window.open(shareUrl, '_blank');
    }

    function shareCanvasImageOnFacebook(canvas: HTMLCanvasElement) {
        const imageType = 'image/png'; // 或者 'image/jpeg'
        // const imageData = canvas.toDataURL(imageType);
        const imgUrl = encodeURIComponent("https://www.fas.scot/wp-content/uploads/2017/09/texel_shearling_tup-300x224.jpg");
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${imgUrl}`;
        window.open(shareUrl, '_blank');
    }

    function shareCanvasImageOnReddit(canvas: HTMLCanvasElement) {
        const imageType = 'image/png'; // 或者 'image/jpeg'
        const imageData = canvas.toDataURL(imageType);
        const shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(imageData)}`;
        console.log("share url", shareUrl);

        window.open(shareUrl, '_blank');
    }

    return (
        <div className="orderly-h-[76px] orderly-bg-base-900 orderly-flex orderly-items-center orderly-justify-center">

            <button onClick={() => {
                saveCanvasImage(getCanvasElement(), "测试");
            }}>
                <DownloadIcon size={36} />
            </button>
            <Divider vertical className="orderly-mx-5 before:orderly-h-[36px] orderly-min-w-[1px]" />

            <button onClick={() => {
                shareCanvasImageOnTwitter(getCanvasElement(), "test share png");
            }}>
                <ShareXIcon className="orderly-mr-5" />
            </button>
            <button>
                <ShareTelegramIcon className="orderly-mr-5" />
            </button>
            <button>
                <ShareRadditIcon className="orderly-mr-5" />
            </button>
            <button onClick={() => {
                shareCanvasImageOnFacebook(getCanvasElement());
            }}>
                <ShareFacebookIcon className="orderly-mr-5" />
            </button>
        </div>
    );
}
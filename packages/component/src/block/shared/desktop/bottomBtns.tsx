import Button from "@/button";
import { ArrowDownToLineIcon } from "@/icon";
import { FC } from "react";
import { CopyIcon } from "./copy";

export const BottomButtons: FC<{
    onClickDownload: any;
    onClickCopy: any;
  }> = (props) => {
    const { onClickDownload, onClickCopy } = props;
  
    return (
      <div className="orderly-h-[76px] orderly-flex orderly-gap-3 orderly-items-center orderly-justify-center">
        <Button
          color={"tertiary"}
          className="orderly-w-[188px] orderly-referral-download-btn-bg"
          onClick={onClickDownload}
        >
          <span>
            <ArrowDownToLineIcon size={16} />
          </span>
          Download
        </Button>
  
        <Button className="orderly-w-[188px]" onClick={onClickCopy}>
          <span>
            <CopyIcon/>
          </span>
          Copy
        </Button>
      </div>
    );
  };
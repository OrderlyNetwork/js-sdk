import React from "react";
import { cn } from "@orderly.network/ui";

export function AbstractConnectArea({ connect }: { connect: () => void }) {
  return (
    <div>
      <div className="oui-text-base-contrast-80 oui-text-sm oui-font-semibold oui-mb-2">
        Abstract
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2">
        <div
          className=" oui-flex oui-items-center oui-justify-start oui-gap-1 oui-rounded-[6px] oui-px-2 oui-bg-[#07080A] oui-py-[11px] oui-flex-1 oui-cursor-pointer"
          onClick={() => connect()}
        >
          <div className="oui-w-[18px] oui-h-[18px] oui-flex oui-items-center oui-justify-center">
            <img
              className={cn("oui-w-[18px] oui-h-[18px]")}
              src={""}
              alt="abstract wallet"
            />
          </div>
          <div className="oui-text-base-contrast oui-text-2xs">Abstract</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FC } from "react";
import {
  ToastBar,
  toast,
  Toaster as PrimitiveToaster,
  ToastOptions,
} from "react-hot-toast";
import { CloseIcon, cn } from "..";
import {
  ToastErrorIcon,
  ToastLoadingIcon,
  ToastSuccessIcon,
} from "../icon/toasterIcons";

interface ToastProps extends ToastOptions {}

export const Toaster: FC<ToastProps> = (props) => {
  return (
    // @ts-ignore
    <PrimitiveToaster
      toastOptions={{
        duration: 3000,
        // style: {
        //   fontSize: "16px",
        //   color: "rgba(255, 255, 255, 0.8)",
        //   padding: 16,
        //   background: "rgba(25, 14, 44, 1)",
        // },
        success: {
          iconTheme: {
            primary: "rgba(123, 220, 138, 1)",
            secondary: "rgba(25, 14, 44, 1)",
          },
          style: {
            // color: "rgba(123, 220, 138, 1)",
            background: "rgba(40, 46, 58, 1)",
          },
        },
        loading: {
          duration: 5000,
          style: {
            background: "rgba(40, 46, 58, 1)",
          },
        },
        error: {
          iconTheme: {
            primary: "rgba(217, 91, 129, 1)",
            secondary: "rgba(25, 14, 44, 1)",
          },
          style: {
            // color: "rgba(217, 91, 129, 1)",
            background: "rgba(40, 46, 58, 1)",
          },
        },
        custom: {
          duration: 5000,
          removeDelay: 0,
          position: "top-right",
          style: {
            background: "rgba(40, 46, 58, 1)",
          },
        },
      }}
      {...props}
      containerClassName={cn(
        "!top-[62px] md:!top-[80px] oui-font-semibold",
        props.className,
      )}
    >
      {(t) => (
        // @ts-ignore
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            color: "rgba(255, 255, 255, 0.8)",
            // background: "rgba(25, 14, 44, 1)",
            borderRadius: "6px",
            wordBreak: "break-all",
            maxWidth: 800,
            boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.36)",
          }}
        >
          {({ icon, message }) => {
            let customIcon = icon;
            if (t.type === "error") {
              customIcon = (
                <ToastErrorIcon className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]" />
              );
            } else if (t.type === "success") {
              customIcon = <ToastSuccessIcon size={20} />;
            } else if (t.type === "loading") {
              customIcon = (
                <div className="oui-animate-rotate-360 oui-rounded-full">
                  <ToastLoadingIcon className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]" />
                </div>
              );
            } else if (t.type === "custom") {
              customIcon = <></>;
            }
            return (
              <div className="oui-flex oui-items-center oui-padding-[12px] md:oui-padding-[16px]">
                {customIcon}
                <div className="oui-text-base oui-px-[2px]">{message}</div>
                {true && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="oui-hidden md:oui-block"
                  >
                    <CloseIcon
                      size={16}
                      className=" oui-text-base-contrast-54"
                    />
                  </button>
                )}
              </div>
            );
          }}
        </ToastBar>
      )}
    </PrimitiveToaster>
  );
};

import React, { FC, SVGProps } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { Box, Flex, cn, Button, Text } from "@orderly.network/ui";

export type AiModeToggleButtonProps = {
  onClick: () => void;
  className?: string;
  aiMode?: boolean;
};

export const AiModeToggleButton: React.FC<AiModeToggleButtonProps> = ({
  onClick,
  className,
  aiMode = false,
}) => {
  const { state } = useAccount();
  const { namespace } = useWalletConnector();

  const tradingEnabledOnEvm =
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected) &&
    namespace === ChainNamespace.evm;

  if (!tradingEnabledOnEvm) return null;

  if (aiMode) {
    // Order Entry button
    return (
      <Box
        className={cn("oui-w-full oui-rounded-[16px] oui-p-px", className)}
        style={{
          backgroundColor: "#608CFF",
        }}
      >
        <Button
          id={"order-entry-toggle-button"}
          type="button"
          onClick={onClick}
          className={cn(
            "oui-w-full oui-h-[28px] oui-px-2 oui-flex oui-items-center oui-justify-center oui-gap-2",
            "oui-rounded-[16px] oui-backdrop-blur-[15px] oui-bg-base-10 hover:oui-bg-base-9",
          )}
        >
          <Text
            className={cn(
              "oui-text-[#608CFF]",
              "oui-text-[12px] oui-leading-[18px] oui-tracking-[0.36px] oui-whitespace-pre",
              "oui-shrink-0",
            )}
          >
            Order entry
          </Text>
          <UpDownIcon />
        </Button>
      </Box>
    );
  }

  // AI Mode button
  return (
    <button
      id={"ai-mode-toggle-button"}
      type="button"
      onClick={onClick}
      className={cn(
        "oui-relative oui-z-0 oui-w-full oui-rounded-[16px] oui-p-px",
        "before:oui-absolute before:oui-inset-0 before:oui-z-[-1] before:oui-rounded-[16px] before:oui-content-['']",
        "after:oui-absolute after:oui-inset-px after:oui-z-[-1] after:oui-box-border after:oui-rounded-[16px] after:oui-content-['']",
        "oui-gradient-ai-button",
        className,
      )}
    >
      <div
        className={cn(
          "oui-w-full oui-h-[28px] oui-px-2 oui-flex oui-items-center oui-justify-center oui-gap-2 oui-relative",
          "oui-rounded-[16px] oui-backdrop-blur-[15px] oui-bg-base-10 hover:oui-bg-base-9",
          "oui-transition-colors oui-cursor-pointer",
        )}
      >
        <Flex itemAlign="center" gapX={1} className="oui-shrink-0">
          <ChatIcon />
          <Text
            className={cn(
              "oui-bg-gradient-to-r oui-from-white oui-to-[#F84600] oui-bg-clip-text oui-text-transparent",
              "oui-text-[12px] oui-leading-[18px] oui-tracking-[0.36px] oui-whitespace-pre",
              "oui-shrink-0",
            )}
          >
            AI Mode by Starchild
          </Text>
        </Flex>
        <UpDownIcon />
      </div>
    </button>
  );
};

const ChatIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="19"
    height="20"
    viewBox="0 0 19 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_13922_127317)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.13473 2.84286L3.99914 0.249634H5.50123L6.36564 2.84286L8.95887 3.70727V5.20936L6.36564 6.07377L5.50123 8.667H3.99914L3.13473 6.07377L0.541504 5.20936V3.70727L3.13473 2.84286ZM4.75018 3.00345L4.51164 3.71908L4.01095 4.21977L3.29532 4.45831L4.01095 4.69686L4.51164 5.19755L4.75018 5.91318L4.98873 5.19755L5.48942 4.69686L6.20505 4.45831L5.48942 4.21977L4.98873 3.71908L4.75018 3.00345ZM13.5289 5.27972C13.1726 5.2506 12.7116 5.24999 12.0335 5.24999H11.0835V3.66665H12.0662C12.7035 3.66664 13.2294 3.66664 13.6579 3.70164C14.1029 3.738 14.5119 3.81603 14.8961 4.0118C15.492 4.3154 15.9764 4.79984 16.28 5.39568C16.4758 5.77991 16.5538 6.18896 16.5902 6.63396C16.6252 7.0624 16.6252 7.58835 16.6252 8.22561V10.9823C16.6252 11.6195 16.6252 12.1455 16.5902 12.5739C16.5538 13.0189 16.4758 13.428 16.28 13.8122C15.9764 14.408 15.492 14.8925 14.8961 15.1961C14.5119 15.3918 14.1029 15.4699 13.6579 15.5062C13.2294 15.5412 12.7035 15.5412 12.0662 15.5412H11.9001L10.1013 17.6401L8.89905 17.6401L7.10031 15.5412H6.93412C6.29686 15.5412 5.77092 15.5412 5.34248 15.5062C4.89748 15.4699 4.48843 15.3918 4.1042 15.1961C3.50836 14.8925 3.02392 14.408 2.72032 13.8122C2.52455 13.428 2.44652 13.0189 2.41016 12.5739C2.37515 12.1455 2.37516 11.6195 2.37517 10.9822L2.37517 10.3956H3.95851V10.9495C3.95851 11.6277 3.95912 12.0887 3.98823 12.445C4.01659 12.7921 4.06799 12.9695 4.13108 13.0934C4.28288 13.3913 4.5251 13.6335 4.82302 13.7853C4.94684 13.8484 5.12433 13.8998 5.47141 13.9281C5.82773 13.9573 6.28871 13.9579 6.96684 13.9579H7.82863L9.50018 15.9084L11.1717 13.9579H12.0335C12.7116 13.9579 13.1726 13.9573 13.5289 13.9281C13.876 13.8998 14.0535 13.8484 14.1773 13.7853C14.4752 13.6335 14.7175 13.3913 14.8693 13.0934C14.9324 12.9695 14.9838 12.7921 15.0121 12.445C15.0412 12.0887 15.0418 11.6277 15.0418 10.9495V8.25832C15.0418 7.5802 15.0412 7.11921 15.0121 6.76289C14.9838 6.41581 14.9324 6.23832 14.8693 6.1145C14.7175 5.81658 14.4752 5.57436 14.1773 5.42256C14.0535 5.35947 13.876 5.30807 13.5289 5.27972Z"
        fill="url(#paint0_linear_13922_127317)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.53091 9.03071L9.04956 7.47477H9.95081L10.4695 9.03071L12.0254 9.54936V10.4506L10.4695 10.9693L9.95081 12.5252H9.04956L8.53091 10.9693L6.97498 10.4506V9.54936L8.53091 9.03071Z"
        fill="url(#paint1_linear_13922_127317)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_13922_127317"
        x1="0.541504"
        y1="8.94489"
        x2="16.6252"
        y2="8.94489"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="#F84600" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_13922_127317"
        x1="0.541504"
        y1="8.94489"
        x2="16.6252"
        y2="8.94489"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="#F84600" />
      </linearGradient>
      <clipPath id="clip0_13922_127317">
        <rect
          width="19"
          height="19"
          fill="white"
          transform="translate(0 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
);

const UpDownIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9.34591 3.83421C9.09349 3.70301 8.78381 3.72522 8.5505 3.90012L5.5505 6.15012C5.21917 6.39862 5.15193 6.86832 5.40036 7.19968C5.64886 7.53102 6.11855 7.59826 6.44992 7.34983L9.00021 5.43675L11.5505 7.34983C11.8819 7.59826 12.3516 7.53102 12.6001 7.19968C12.8485 6.86832 12.7813 6.39862 12.4499 6.15012L9.44992 3.90012L9.34591 3.83421Z"
      fill="white"
      fillOpacity="0.54"
    />
    <path
      d="M9.34591 14.3533C9.09349 14.4845 8.78381 14.4623 8.5505 14.2874L5.5505 12.0374C5.21917 11.7889 5.15193 11.3192 5.40036 10.9878C5.64886 10.6565 6.11855 10.5892 6.44992 10.8377L9.00021 12.7508L11.5505 10.8377C11.8819 10.5892 12.3516 10.6565 12.6001 10.9878C12.8485 11.3192 12.7813 11.7889 12.4499 12.0374L9.44992 14.2874L9.34591 14.3533Z"
      fill="white"
      fillOpacity="0.54"
    />
  </svg>
);

export default AiModeToggleButton;

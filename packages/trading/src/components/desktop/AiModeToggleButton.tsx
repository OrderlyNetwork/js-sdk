import React, { FC, SVGProps } from "react";
import {
  useAccount,
  useWalletConnector,
  useStarChildInitialized,
} from "@orderly.network/hooks";
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
  const isStarChildInitialized = useStarChildInitialized();

  const tradingEnabledOnEvm =
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected) &&
    namespace === ChainNamespace.evm;

  if (!tradingEnabledOnEvm || !isStarChildInitialized) return null;

  if (aiMode) {
    // Order Entry button
    return (
      <Box
        className={cn("oui-w-full oui-rounded-md oui-p-px", className)}
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
            "oui-rounded-md oui-backdrop-blur-[15px] oui-bg-base-10 hover:oui-bg-base-9",
          )}
        >
          <Box className="oui-flex oui-items-center oui-gap-1">
            <TradingIcon />
            <Text
              className={cn(
                "oui-text-[#608CFF]",
                "oui-text-[12px] oui-leading-[18px] oui-tracking-[0.36px] oui-whitespace-pre",
                "oui-shrink-0",
              )}
            >
              Trade Panel
            </Text>
          </Box>
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
        "oui-relative oui-z-0 oui-w-full oui-rounded-md oui-p-px",
        "oui-bg-gradient-to-l oui-from-[#59B0FE] oui-to-[#26FEFE]",
        className,
      )}
    >
      <div
        className={cn(
          "oui-w-full oui-h-[28px] oui-px-2 oui-flex oui-items-center oui-justify-center oui-gap-2 oui-relative",
          "oui-rounded-md oui-bg-base-10 hover:oui-bg-base-9",
          "oui-cursor-pointer",
        )}
      >
        <Flex itemAlign="center" gapX={1} className="oui-shrink-0">
          <StarChildChatIcon className="oui-w-4.5 oui-h-4.5 oui-shrink-0" />
          <Text
            className={cn(
              "oui-bg-gradient-to-l oui-from-[#59B0FE] oui-to-[#26FEFE] oui-bg-clip-text oui-text-transparent",
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

const StarChildChatIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_13991_11517)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.13473 2.34286L3.99914 -0.250366H5.50123L6.36564 2.34286L8.95887 3.20727V4.70936L6.36564 5.57377L5.50123 8.167H3.99914L3.13473 5.57377L0.541504 4.70936V3.20727L3.13473 2.34286ZM4.75018 2.50345L4.51164 3.21908L4.01095 3.71977L3.29532 3.95831L4.01095 4.19686L4.51164 4.69755L4.75018 5.41318L4.98873 4.69755L5.48942 4.19686L6.20505 3.95831L5.48942 3.71977L4.98873 3.21908L4.75018 2.50345ZM13.5289 4.77972C13.1726 4.7506 12.7116 4.74999 12.0335 4.74999H11.0835V3.16665H12.0662C12.7035 3.16664 13.2294 3.16664 13.6579 3.20164C14.1029 3.238 14.5119 3.31603 14.8961 3.5118C15.492 3.8154 15.9764 4.29984 16.28 4.89568C16.4758 5.27991 16.5538 5.68896 16.5902 6.13396C16.6252 6.5624 16.6252 7.08835 16.6252 7.72561V10.4823C16.6252 11.1195 16.6252 11.6455 16.5902 12.0739C16.5538 12.5189 16.4758 12.928 16.28 13.3122C15.9764 13.908 15.492 14.3925 14.8961 14.6961C14.5119 14.8918 14.1029 14.9699 13.6579 15.0062C13.2294 15.0412 12.7035 15.0412 12.0662 15.0412H11.9001L10.1013 17.1401L8.89905 17.1401L7.10031 15.0412H6.93412C6.29686 15.0412 5.77092 15.0412 5.34248 15.0062C4.89748 14.9699 4.48843 14.8918 4.1042 14.6961C3.50836 14.3925 3.02392 13.908 2.72032 13.3122C2.52455 12.928 2.44652 12.5189 2.41016 12.0739C2.37515 11.6455 2.37516 11.1195 2.37517 10.4822L2.37517 9.8956H3.95851V10.4495C3.95851 11.1277 3.95912 11.5887 3.98823 11.945C4.01659 12.2921 4.06799 12.4695 4.13108 12.5934C4.28288 12.8913 4.5251 13.1335 4.82302 13.2853C4.94684 13.3484 5.12433 13.3998 5.47141 13.4281C5.82773 13.4573 6.28871 13.4579 6.96684 13.4579H7.82863L9.50018 15.4084L11.1717 13.4579H12.0335C12.7116 13.4579 13.1726 13.4573 13.5289 13.4281C13.876 13.3998 14.0535 13.3484 14.1773 13.2853C14.4752 13.1335 14.7175 12.8913 14.8693 12.5934C14.9324 12.4695 14.9838 12.2921 15.0121 11.945C15.0412 11.5887 15.0418 11.1277 15.0418 10.4495V7.75832C15.0418 7.0802 15.0412 6.61921 15.0121 6.26289C14.9838 5.91581 14.9324 5.73832 14.8693 5.6145C14.7175 5.31658 14.4752 5.07436 14.1773 4.92256C14.0535 4.85947 13.876 4.80807 13.5289 4.77972Z"
        fill="url(#paint0_linear_13991_11517)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.53091 8.53071L9.04956 6.97477H9.95081L10.4695 8.53071L12.0254 9.04936V9.95061L10.4695 10.4693L9.95081 12.0252H9.04956L8.53091 10.4693L6.97498 9.95061V9.04936L8.53091 8.53071Z"
        fill="url(#paint1_linear_13991_11517)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_13991_11517"
        x1="16.6252"
        y1="8.44488"
        x2="0.541504"
        y2="8.44488"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#59B0FE" />
        <stop offset="1" stopColor="#26FEFE" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_13991_11517"
        x1="16.6252"
        y1="8.44488"
        x2="0.541504"
        y2="8.44488"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#59B0FE" />
        <stop offset="1" stopColor="#26FEFE" />
      </linearGradient>
      <clipPath id="clip0_13991_11517">
        <rect width="19" height="19" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const TradingIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.5 5.25C1.5 4.83579 1.83579 4.5 2.25 4.5H3.87679C5.45747 4.5 6.92225 5.32934 7.7355 6.68477L10.0507 10.5435C10.5929 11.4471 11.5694 12 12.6232 12H14.25V10.5L16.5 12.75L14.25 15V13.5H12.6232C11.0425 13.5 9.57775 12.6707 8.76449 11.3152L6.44926 7.45651C5.90709 6.5529 4.93057 6 3.87679 6H2.25C1.83579 6 1.5 5.66421 1.5 5.25Z"
      fill="#608CFF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.25 13.5C1.83579 13.5 1.5 13.1642 1.5 12.75C1.5 12.3358 1.83579 12 2.25 12H3.87679C4.93057 12 5.90709 11.4471 6.44926 10.5435L7.37536 9L8.25 10.4577L7.7355 11.3152C6.92225 12.6707 5.45747 13.5 3.87679 13.5H2.25ZM9.12464 9L10.0507 7.45651C10.5929 6.5529 11.5694 6 12.6232 6H14.25V7.5L16.5 5.25L14.25 3V4.5H12.6232C11.0425 4.5 9.57775 5.32935 8.76449 6.68477L8.25 7.54226L9.12464 9Z"
      fill="#608CFF"
    />
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

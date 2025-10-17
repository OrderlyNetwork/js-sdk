import React from "react";
import { Button, Flex, Text, Box, cn } from "@orderly.network/ui";
import { useTelegramBinding } from "../hooks/useTelegramBinding";
import type { TelegramUserData, WalletData, BindingData } from "../types";
import { StarchildIcon } from "./StarchildIcon";
import { TelegramIcon } from "./TelegramIcon";
import {
  AnnouncementIcon,
  NewsIcon,
  MeteorIcon,
  ShieldIcon,
  ShieldShadedIcon,
  CloseIcon,
  DragHandleIcon,
  CheckIcon,
} from "./icons";

interface TelegramBindingProps {
  onTelegramConnected?: (telegramData: TelegramUserData) => void;
  onWalletConnected?: (walletData: WalletData) => void;
  onBindingComplete?: (bindingData: BindingData) => void;
  onClose?: () => void;
  startDragging?: (e: React.MouseEvent | React.TouchEvent) => void;
  dragging?: boolean;
}

export const TelegramBinding: React.FC<TelegramBindingProps> = ({
  onTelegramConnected,
  onWalletConnected,
  onBindingComplete,
  onClose,
  startDragging,
  dragging,
}) => {
  const {
    telegramUser,
    isWalletConnected,
    isBinding,
    bindingStatus,
    handleTelegramLogin,
    walletAddress,
    getTemporaryOrderlyKey,
    registerOrderlyKey,
  } = useTelegramBinding(
    onTelegramConnected,
    onWalletConnected,
    onBindingComplete,
  );

  const handleCreateOrderlyKey = React.useCallback(async () => {
    try {
      // Fetch temporary orderly key pair
      const { orderlyKey, privateKey } = await getTemporaryOrderlyKey();
      console.log("orderlyKey", orderlyKey);
      console.log("privateKey", privateKey);

      if (!orderlyKey || !privateKey) {
        console.error("Temporary orderly key response missing fields");
        return;
      }

      // Register orderly private key
      const result = await registerOrderlyKey(orderlyKey, {
        userAddress: walletAddress,
        chainId: 421614,
      });
      console.log("Orderly key registered", result);
    } catch (e) {
      console.error("Create/register orderly key error", e);
    }
  }, [walletAddress, getTemporaryOrderlyKey, registerOrderlyKey]);

  return (
    <Box
      r="2xl"
      className={cn(
        "oui-relative",
        "oui-bg-base-9",
        "oui-overflow-hidden",
        "oui-border",
        "oui-border-base-contrast-12",
        "oui-p-3",
        "oui-flex",
        "oui-flex-col",
      )}
      style={{
        width: "420px",
        height: "680px",
      }}
    >
      {/* Header */}
      <Box className="oui-flex oui-items-center oui-justify-between oui-mt-1">
        <Flex gap={2} itemAlign="center">
          {/* Drag Handle */}
          {startDragging && (
            <button
              onMouseDown={startDragging}
              onTouchStart={startDragging}
              className="oui-cursor-grab active:oui-cursor-grabbing oui-text-base-contrast-80 hover:oui-text-base-contrast-98 oui-transition-colors oui-p-1"
              style={{
                cursor: dragging ? "grabbing" : "grab",
              }}
              aria-label="Drag dialog"
              title="Drag"
            >
              <DragHandleIcon />
            </button>
          )}
          <Box className="oui-relative oui-rounded-lg oui-overflow-hidden oui-w-10 oui-h-10">
            <StarchildIcon size={40} />
          </Box>
          <Text className="oui-text-white/98 oui-font-semibold oui-tracking-wide">
            Starchild
          </Text>
        </Flex>
        {onClose && (
          <button
            onClick={onClose}
            className="oui-w-6 oui-h-6 oui-flex oui-items-center oui-justify-center oui-text-white/80 hover:oui-text-white oui-transition-colors"
            aria-label="Close"
          >
            <CloseIcon size={24} />
          </button>
        )}
      </Box>

      {/* Success State - only after binding finished */}
      {bindingStatus === "success" && !isBinding ? (
        <Box className="oui-flex-1 oui-flex oui-flex-col oui-items-center oui-gap-5">
          {/* Success Icon */}
          <Box className="oui-relative oui-rounded-full oui-overflow-hidden oui-w-20 oui-h-20 oui-p-3 oui-mt-10 oui-flex oui-items-center oui-justify-center">
            <CheckIcon size={54} className="oui-text-primary" />
          </Box>

          {/* Success Message */}
          <Box className="oui-flex oui-flex-col oui-gap-5 oui-items-center oui-w-full">
            <Box className="oui-text-center oui-flex oui-flex-col oui-gap-5">
              <Text className="oui-text-base-contrast-98 oui-text-2xl oui-font-semibold oui-tracking-wider">
                Your Starchild is ready!
              </Text>
              <Text
                size="sm"
                className="oui-text-base-contrast-54 oui-leading-relaxed"
              >
                Now start your trading journey! I will be waiting for your call
                in the bottom right corner
              </Text>
            </Box>

            {/* Create Button */}
            <Button
              onClick={handleCreateOrderlyKey}
              className="oui-rounded-full oui-px-3 oui-h-10 oui-w-[120px]"
              style={{ backgroundColor: "#F84600" }}
            >
              <Text
                size="sm"
                className="oui-text-primary-contrast oui-font-semibold"
              >
                Create
              </Text>
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {/* Title Section with Connect Button */}
          <Box className="oui-mt-7 oui-space-y-5">
            <Box className="oui-text-center oui-flex oui-flex-col oui-gap-y-2">
              <Text className="oui-text-base-contrast-98 oui-text-xl oui-font-normal oui-tracking-wide">
                Telegram Not Connected
              </Text>
              <Text size="sm" className="oui-text-base-contrast-54">
                Connect Telegram to receive trading notifications
              </Text>
            </Box>
            <Flex justify="center">
              <Button
                onClick={handleTelegramLogin}
                disabled={isBinding}
                className={cn(
                  "oui-rounded-full oui-px-3 oui-h-10 oui-transition-colors",
                  isBinding
                    ? "oui-bg-[#2c5a80] oui-cursor-not-allowed"
                    : "oui-bg-[#3D79A9] hover:oui-bg-[#2c5a80]",
                )}
              >
                <Flex gap={1} itemAlign="center">
                  {isBinding ? (
                    <>
                      <svg
                        className="oui-animate-spin oui-h-4 oui-w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="oui-opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="oui-opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <Text
                        size="sm"
                        className="oui-text-primary-contrast oui-font-semibold"
                      >
                        Authorizing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <TelegramIcon />
                      <Text
                        size="sm"
                        className="oui-text-primary-contrast oui-font-semibold"
                      >
                        Connect telegram account
                      </Text>
                    </>
                  )}
                </Flex>
              </Button>
            </Flex>
          </Box>

          {/* Features Section */}
          <Box className="oui-mt-7 oui-p-3 oui-space-y-4">
            {/* Features Header */}
            <Flex gap={1} itemAlign="center" justify="center">
              <ShieldShadedIcon size={24} className="oui-text-primary" />
              <Text
                size="base"
                className="oui-font-semibold oui-tracking-wide"
                style={{
                  background:
                    "linear-gradient(135deg, #00D4FF 0%, #00A8E8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Features After Connection
              </Text>
            </Flex>

            {/* Features List */}
            <Box className="oui-bg-black/24 oui-border oui-border-base-contrast-12 oui-rounded-2xl oui-p-2 oui-space-y-0">
              {/* Trading Notifications */}
              <Box className="oui-p-2 oui-rounded-lg hover:oui-bg-white/5 oui-transition-colors">
                <Flex gap={2} itemAlign="start">
                  <AnnouncementIcon
                    size={24}
                    className="oui-text-base-contrast-80 oui-shrink-0"
                  />
                  <Box className="oui-flex-1 oui-flex oui-flex-col oui-space-y-0.5">
                    <Text size="base" className="oui-text-base-contrast-80">
                      Trading Notifications
                    </Text>
                    <Text
                      size="xs"
                      className="oui-text-base-contrast-36 oui-leading-relaxed"
                    >
                      Receive real-time notifications for trade execution,
                      stop-loss, take-profit, etc.
                    </Text>
                  </Box>
                </Flex>
              </Box>

              {/* Market Alerts */}
              <Box className="oui-p-2 oui-rounded-lg hover:oui-bg-white/5 oui-transition-colors">
                <Flex gap={2} itemAlign="start">
                  <NewsIcon
                    size={24}
                    className="oui-text-base-contrast-80 oui-shrink-0"
                  />
                  <Box className="oui-flex-1 oui-flex oui-flex-col oui-space-y-0.5">
                    <Text size="base" className="oui-text-white/80">
                      Market Alerts
                    </Text>
                    <Text
                      size="xs"
                      className="oui-text-base-contrast-36 oui-leading-relaxed"
                    >
                      Instant alerts for important market events and price
                      movements
                    </Text>
                  </Box>
                </Flex>
              </Box>

              {/* AI Analysis Reports */}
              <Box className="oui-p-2 oui-rounded-lg hover:oui-bg-white/5 oui-transition-colors">
                <Flex gap={2} itemAlign="start">
                  <MeteorIcon
                    size={24}
                    className="oui-text-base-contrast-80 oui-shrink-0"
                  />
                  <Box className="oui-flex-1 oui-flex oui-flex-col oui-space-y-0.5">
                    <Text size="base" className="oui-text-white/80">
                      AI Analysis Reports
                    </Text>
                    <Text
                      size="xs"
                      className="oui-text-base-contrast-36 oui-leading-relaxed"
                    >
                      Regular AI-generated market analysis and technical reports
                    </Text>
                  </Box>
                </Flex>
              </Box>

              {/* Account Security */}
              <Box className="oui-p-2 oui-rounded-lg hover:oui-bg-white/5 oui-transition-colors">
                <Flex gap={2} itemAlign="start">
                  <ShieldIcon
                    size={24}
                    className="oui-text-base-contrast-80 oui-shrink-0"
                  />
                  <Box className="oui-flex-1 oui-flex oui-flex-col oui-space-y-0.5">
                    <Text size="base" className="oui-text-white/80">
                      Account Security
                    </Text>
                    <Text
                      size="xs"
                      className="oui-text-base-contrast-36 oui-leading-relaxed"
                    >
                      Security alerts for unusual logins and important
                      operations
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

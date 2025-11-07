import React from "react";
import { Button, Flex, Text, Box, cn } from "@orderly.network/ui";
import starchildBG from "../assets/starchildBG.png";
import starchildRobot from "../assets/starchildRobot.png";
import { useTelegramBinding } from "../hooks/useTelegramBinding";
import type { TelegramUserData, WalletData, BindingData } from "../types";
import {
  AnnouncementIcon,
  NewsIcon,
  MeteorIcon,
  ShieldIcon,
  ShieldShadedIcon,
  CloseIcon,
  CheckIcon,
  TelegramIcon,
  LoadingIcon,
} from "./icons";

interface TelegramBindingProps {
  onTelegramConnected?: (telegramData: TelegramUserData) => void;
  onWalletConnected?: (walletData: WalletData) => void;
  onBindingComplete?: (bindingData: BindingData) => void;
  onClose?: () => void;
}

export const TelegramBinding: React.FC<TelegramBindingProps> = ({
  onTelegramConnected,
  onWalletConnected,
  onBindingComplete,
  onClose,
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
    verifyOrderlyKey,
    hasOrderlyPrivateKey,
    hasVerifiedOrderly,
  } = useTelegramBinding(
    onTelegramConnected,
    onWalletConnected,
    onBindingComplete,
  );

  const shouldShowSignInPage = hasOrderlyPrivateKey && !hasVerifiedOrderly;

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

  const handleSignIn = React.useCallback(async () => {
    try {
      const result = await verifyOrderlyKey();
      console.log("Orderly key verified", result);
    } catch (e) {
      console.error("Verify orderly key error", e);
    }
  }, [verifyOrderlyKey]);

  // Auto-close dialog when account is fully ready
  React.useEffect(() => {
    if (
      bindingStatus === "success" &&
      hasOrderlyPrivateKey &&
      hasVerifiedOrderly &&
      !isBinding
    ) {
      console.log("Account fully ready, closing dialog");
      if (onClose) {
        onClose();
      }
    }
  }, [
    bindingStatus,
    hasOrderlyPrivateKey,
    hasVerifiedOrderly,
    isBinding,
    onClose,
  ]);

  return (
    <Box
      r="2xl"
      className={cn(
        "oui-relative",
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
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${starchildBG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <Box className="oui-flex oui-items-center oui-justify-between oui-mt-1">
        <Flex gap={2} itemAlign="center">
          <Box className="oui-relative oui-rounded-lg oui-overflow-hidden oui-w-10 oui-h-10">
            <img src={starchildRobot} alt="Starchild" width={40} height={40} />
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

      {/* Sign In Page - after orderly key creation */}
      {shouldShowSignInPage ? (
        <Box className="oui-flex-1 oui-flex oui-flex-col oui-items-center oui-gap-5">
          {/* Success Icon */}
          <Box className="oui-relative oui-rounded-full oui-overflow-hidden oui-w-20 oui-h-20 oui-p-3 oui-mt-10 oui-flex oui-items-center oui-justify-center">
            <CheckIcon size={54} className="oui-text-primary" />
          </Box>

          {/* Sign In Message */}
          <Box className="oui-flex oui-flex-col oui-gap-5 oui-items-center oui-w-full">
            <Box className="oui-text-center oui-flex oui-flex-col oui-gap-5">
              <Text className="oui-text-base-contrast-98 oui-text-2xl oui-font-semibold oui-tracking-wider">
                Your API key is created
              </Text>
              <Text
                size="sm"
                className="oui-text-base-contrast-54 oui-leading-relaxed"
              >
                Please authorize Starchild to use your existing API Key from the
                Woofi for order operations.
              </Text>
            </Box>

            {/* Sign In Button */}
            <Button
              onClick={handleSignIn}
              className="oui-rounded-full oui-px-3 oui-h-10 oui-w-[120px]"
              style={{
                background: "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
              }}
            >
              <Text size="sm" className="oui-text-black/[.88] oui-font-medium">
                Sign In
              </Text>
            </Button>
          </Box>
        </Box>
      ) : /* Success State - only after binding finished */
      bindingStatus === "success" && !isBinding ? (
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
                Before getting started, we need to generate a read-only API key
                for data access. Please click the button below to authorize with
                your signature.
              </Text>
            </Box>

            {/* Create Button */}
            <Button
              onClick={handleCreateOrderlyKey}
              className="oui-rounded-full oui-px-3 oui-h-10 oui-w-[120px]"
              style={{
                background: "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
              }}
            >
              <Text size="sm" className="oui-text-black/[.88] oui-font-medium">
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
              <Text className="oui-text-base-contrast-98 oui-text-xl oui-font-medium oui-tracking-wide">
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
                      <LoadingIcon
                        size={24}
                        className="oui-animate-spin oui-text-base-contrast-80"
                      />
                      <Text
                        size="sm"
                        className="oui-text-base-contrast-80 oui-font-semibold"
                      >
                        Authorizing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <TelegramIcon />
                      <Text
                        size="sm"
                        className="oui-text-base-contrast-80 oui-font-semibold"
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
                    <Text size="base" className="oui-text-base-contrast-80">
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
                    <Text size="base" className="oui-text-base-contrast-80">
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
                    <Text size="base" className="oui-text-base-contrast-80">
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

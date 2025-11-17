import React from "react";
import { Button, Flex, Text, Box, cn } from "@orderly.network/ui";
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

const STARCHILD_BG_SRC =
  "https://storage.googleapis.com/oss.orderly.network/static/starchild/starchildBG.png";
const STARCHILD_ROBOT_SRC =
  "https://storage.googleapis.com/oss.orderly.network/static/starchild/starchildRobot.png";

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
    selectedChainId,
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

  const shouldShowCreateKey = !hasOrderlyPrivateKey;
  const shouldShowSignInPage = hasOrderlyPrivateKey && !hasVerifiedOrderly;

  const [isCreating, setIsCreating] = React.useState(false);
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleCreateOrderlyKey = React.useCallback(async () => {
    setIsCreating(true);
    try {
      // Fetch temporary orderly key pair
      const { orderlyKey, privateKey } = await getTemporaryOrderlyKey();
      if (!orderlyKey || !privateKey) {
        console.error("Temporary orderly key response missing fields");
        return;
      }

      await registerOrderlyKey(orderlyKey, {
        userAddress: walletAddress,
        chainId: selectedChainId,
        expiration: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
    } catch (e) {
      console.error("Create/register orderly key error", e);
    } finally {
      setIsCreating(false);
    }
  }, [
    walletAddress,
    selectedChainId,
    getTemporaryOrderlyKey,
    registerOrderlyKey,
  ]);

  const handleSignIn = React.useCallback(async () => {
    setIsSigningIn(true);
    try {
      const result = await verifyOrderlyKey();
      console.log("Orderly key verified", result);
    } catch (e) {
      console.error("Verify orderly key error", e);
    } finally {
      setIsSigningIn(false);
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
        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${STARCHILD_BG_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <Box className="oui-flex oui-items-center oui-justify-between oui-mt-1">
        <Flex gap={2} itemAlign="center">
          <Box className="oui-relative oui-rounded-lg oui-overflow-hidden oui-w-10 oui-h-10">
            <img
              src={STARCHILD_ROBOT_SRC}
              alt="Starchild"
              width={40}
              height={40}
            />
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
        <Box
          className="oui-flex-1 oui-flex oui-flex-col oui-items-center oui-gap-5"
          style={{ marginTop: "108px" }}
        >
          {/* Success Icon */}
          <Box className="oui-relative oui-rounded-full oui-overflow-hidden oui-w-20 oui-h-20 oui-p-3 oui-flex oui-items-center oui-justify-center">
            <CheckIcon size={54} className="oui-text-primary" />
          </Box>

          {/* Sign In Message */}
          <Box className="oui-flex oui-flex-col oui-gap-5 oui-items-center oui-w-full">
            <Box className="oui-text-center oui-flex oui-flex-col oui-gap-5">
              <Text className="oui-text-base-contrast-98 oui-text-2xl oui-font-semibold oui-tracking-wider">
                Your API key has been created!
              </Text>
              <Text
                size="sm"
                className="oui-text-base-contrast-54 oui-leading-relaxed"
              >
                Please authorize Starchild to use your API key
              </Text>
            </Box>

            {/* Sign In Button */}
            <Button
              onClick={handleSignIn}
              disabled={isSigningIn || isBinding}
              className={cn(
                "oui-rounded-full oui-px-3 oui-h-10 oui-w-[120px]",
                (isSigningIn || isBinding) && "oui-cursor-not-allowed",
              )}
              style={{
                background:
                  isSigningIn || isBinding
                    ? "linear-gradient(270deg, #2c5a80 0%, #1a3d5a 100%)"
                    : "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
              }}
            >
              {isSigningIn || isBinding ? (
                <Flex gap={1} itemAlign="center">
                  <LoadingIcon
                    size={20}
                    className="oui-animate-spin oui-text-black/[.88]"
                  />
                </Flex>
              ) : (
                <Text
                  size="sm"
                  className="oui-text-black/[.88] oui-font-medium"
                >
                  Sign In
                </Text>
              )}
            </Button>
          </Box>
        </Box>
      ) : shouldShowCreateKey ? (
        <Box
          className="oui-flex-1 oui-flex oui-flex-col oui-items-center oui-gap-5"
          style={{ marginTop: "108px" }}
        >
          <Box className="oui-relative oui-rounded-full oui-overflow-hidden oui-w-20 oui-h-20 oui-p-3 oui-flex oui-items-center oui-justify-center">
            <CheckIcon size={54} className="oui-text-primary" />
          </Box>

          <Box className="oui-flex oui-flex-col oui-gap-5 oui-items-center oui-w-full">
            <Box className="oui-text-center oui-flex oui-flex-col oui-gap-5">
              <Text className="oui-text-base-contrast-98 oui-text-2xl oui-font-semibold oui-tracking-wider">
                AI trading awaits!
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
              disabled={isCreating || isBinding}
              className={cn(
                "oui-rounded-full oui-px-3 oui-h-10 oui-w-[120px]",
                (isCreating || isBinding) && "oui-cursor-not-allowed",
              )}
              style={{
                background:
                  isCreating || isBinding
                    ? "linear-gradient(270deg, #2c5a80 0%, #1a3d5a 100%)"
                    : "linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)",
              }}
            >
              {isCreating || isBinding ? (
                <Flex gap={1} itemAlign="center">
                  <LoadingIcon
                    size={20}
                    className="oui-animate-spin oui-text-black/[.88]"
                  />
                </Flex>
              ) : (
                <Text
                  size="sm"
                  className="oui-text-black/[.88] oui-font-medium"
                >
                  Create
                </Text>
              )}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="oui-flex-1 oui-flex oui-flex-col oui-items-center oui-justify-center oui-space-y-5">
          {/* Title Section with Connect Button */}
          <Box className="oui-space-y-5">
            <Box className="oui-text-center oui-flex oui-flex-col oui-gap-y-2">
              <Text className="oui-text-base-contrast-98 oui-text-xl oui-tracking-wide">
                Telegram Not Connected
              </Text>
              <Text size="sm" className="oui-text-base-contrast-54">
                Connect Telegram to receive trading notifications
              </Text>
            </Box>
            <Flex
              direction="column"
              gap={3}
              itemAlign="center"
              className="oui-w-fit oui-mx-auto"
            >
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
              {!isBinding && (
                <Button
                  onClick={() => {
                    if (onClose) {
                      onClose();
                    }
                    try {
                      const evt = new CustomEvent("starchild:accountInfoReady");
                      window.dispatchEvent(evt);
                    } catch {
                      // ignore
                    }
                  }}
                  variant="outlined"
                  color="secondary"
                  className="oui-rounded-full oui-px-3 oui-h-10 oui-w-full"
                >
                  <Text size="sm" className="oui-font-medium">
                    Skip
                  </Text>
                </Button>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

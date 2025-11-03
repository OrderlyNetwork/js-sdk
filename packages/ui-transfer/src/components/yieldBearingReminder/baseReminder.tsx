import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex } from "@orderly.network/ui";
import { ReminderTheme } from "./themes";

export interface BaseReminderProps {
  /** APY value in percentage (e.g., 8.5 for 8.5%) */
  apy: number | null;
  /** Whether the APY data is currently loading */
  loading: boolean;
  /** External URL to the asset issuer's website */
  externalUrl: string | null;
  /** Additional CSS class name */
  className?: string;
  /** Theme configuration */
  theme: ReminderTheme;
  /** Test ID for the component */
  testId?: string;
}

/**
 * Base Yield Reminder Component
 * Generic reminder component that renders based on provided theme configuration
 * Used by YUSD and deUSD specific components
 */
export const BaseReminder: FC<BaseReminderProps> = ({
  apy,
  loading,
  externalUrl,
  className,
  theme,
  testId,
}) => {
  const { t } = useTranslation();
  const formattedAPY = apy !== null ? apy.toFixed(1) : null;

  return (
    <Box
      className={`oui-rounded-2xl oui-relative oui-overflow-hidden ${className || ""}`}
      data-testid={testId}
      style={{
        height: "142px",
        width: "100%",
        maxWidth: "380px",
      }}
    >
      {/* Background image */}
      <Box
        className="oui-absolute"
        style={{
          height: "230px",
          left: 0,
          top: "-40px",
          width: "100%",
        }}
      >
        <img
          src={theme.background.image}
          alt=""
          className="oui-absolute oui-w-full oui-h-full"
          style={theme.background.style}
        />
      </Box>

      {/* Decorative images */}
      {theme.decorations.map((decoration, index) => {
        const imageElement = (
          <img
            key={index}
            src={decoration.src}
            alt=""
            className={`oui-absolute ${decoration.blur ? `oui-blur-[${decoration.blur}]` : ""}`}
            style={{
              width: decoration.size.width,
              height: decoration.size.height,
              left: decoration.position.left,
              top: decoration.position.top,
              transform: decoration.transform,
              pointerEvents: "none",
              zIndex: decoration.zIndex,
              filter: decoration.blur ? `blur(${decoration.blur})` : undefined,
            }}
          />
        );

        // Some decorations need a wrapper container (e.g., deUSD top-right bubbles)
        if (decoration.wrapper) {
          return (
            <Box
              key={index}
              className="oui-absolute oui-flex oui-items-center oui-justify-center"
              style={{
                left: decoration.position.left,
                top: decoration.position.top,
                width: decoration.size.width,
                height: decoration.size.height,
                transform: decoration.transform,
                pointerEvents: "none",
                zIndex: decoration.zIndex,
              }}
            >
              <img
                src={decoration.src}
                alt=""
                className="oui-w-full oui-h-full"
                style={{
                  objectFit: "contain",
                }}
              />
            </Box>
          );
        }

        return imageElement;
      })}

      {/* Content */}
      <Flex
        direction="column"
        itemAlign="start"
        className="oui-absolute oui-z-10"
        style={{
          left: "16px",
          right: "16px",
          top: "16px",
          gap: "16px",
        }}
      >
        {/* Main text section */}
        <Flex
          direction="column"
          itemAlign="start"
          style={{ gap: 0, width: "100%" }}
        >
          <div
            style={{
              fontFamily: "'DIN 2014', sans-serif",
              fontSize: "18px",
              fontWeight: theme.mainTextWeight || 600,
              lineHeight: "26px",
              letterSpacing: "0.54px",
              color: theme.colors.mainText,
              whiteSpace: "pre-wrap",
              width: "100%",
            }}
          >
            {loading ? (
              <span className="oui-animate-pulse">
                {t("transfer.deposit.yieldReminder.loading")}
              </span>
            ) : formattedAPY !== null ? (
              <span
                style={{
                  fontWeight: theme.apyUseBold
                    ? 700
                    : theme.mainTextWeight || 600,
                  color: theme.colors.apyHighlight,
                }}
              >
                {t("transfer.deposit.yieldReminder.earnAPY", {
                  apy: formattedAPY,
                })}
              </span>
            ) : (
              <span
                style={{
                  fontWeight: 700,
                  color: theme.colors.mainText,
                }}
              >
                {t("transfer.deposit.yieldReminder.earnRewards")}
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: "'DIN 2014', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "18px",
              letterSpacing: "0.36px",
              color: theme.colors.secondaryText,
              width: "100%",
            }}
          >
            {t("transfer.deposit.yieldReminder.distribution")}
          </div>
        </Flex>

        {/* Bottom section: Disclaimer and button */}
        <Flex
          direction="column"
          itemAlign="start"
          style={{ gap: "2px", width: "100%" }}
        >
          {/* Disclaimer - only show when APY is available */}
          {formattedAPY !== null && (
            <div
              style={{
                fontFamily: "'DIN 2014', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "18px",
                letterSpacing: "0.36px",
                color: theme.colors.disclaimer,
                whiteSpace: "pre-wrap",
              }}
            >
              {t("transfer.deposit.yieldReminder.disclaimer")}
            </div>
          )}

          {/* External link */}
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="oui-inline-flex oui-items-center oui-no-underline hover:oui-opacity-80 oui-transition-opacity"
              style={{
                gap: "2px",
                background: theme.button.background,
                paddingLeft: theme.button.paddingLeft,
                paddingRight: theme.button.paddingRight,
                paddingTop: theme.button.paddingTop,
                paddingBottom: theme.button.paddingBottom,
                borderRadius: theme.button.borderRadius,
              }}
            >
              <span
                style={{
                  fontFamily: "'DIN 2014', sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: "18px",
                  letterSpacing: "0.36px",
                  color: theme.colors.buttonText,
                }}
              >
                {t("transfer.deposit.yieldReminder.moreDetails")}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M6.41748 4.08496L9.91748 7.58496L6.41748 11.085"
                  stroke={theme.colors.buttonText}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

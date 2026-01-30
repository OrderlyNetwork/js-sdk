import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CaretDownIcon,
  Flex,
  InfoCircleIcon,
  Text,
  TokenIcon,
  Tooltip,
  modal,
  useScreen,
} from "@orderly.network/ui";

type DepositTokenValueFormatterProps = {
  value: string;
  userMaxQty?: number | null;
};

export const DepositTokenValueFormatter: FC<
  DepositTokenValueFormatterProps
> = ({ value, userMaxQty }) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const renderDepositCapTooltipContent = () => (
    <Flex direction="column" itemAlign="start">
      <Text size="2xs" weight="semibold" intensity={36}>
        {t("transfer.depositCap.tooltip")}
        <Text as="span" size="2xs" weight="semibold" intensity={80}>
          {value}.
        </Text>
      </Text>
      <a
        href="https://orderly.network/docs/introduction/trade-on-orderly/multi-collateral#max-deposits-user"
        target="_blank"
        rel="noopener noreferrer"
        className="oui-text-2xs oui-text-primary"
      >
        {t("common.learnMore")}
      </a>
    </Flex>
  );

  const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    modal.alert({
      title: t("common.tips"),
      message: <Box>{renderDepositCapTooltipContent()}</Box>,
    });
  };

  return (
    <Flex direction="column" itemAlign="end" gapY={1}>
      <Flex gapX={1} itemAlign="center">
        <TokenIcon name={value} className="oui-size-[16px]" />
        <Text weight="semibold" intensity={54}>
          {value}
        </Text>
        <CaretDownIcon
          size={12}
          className="oui-text-base-contrast-54"
          opacity={1}
        />
      </Flex>
      <Flex itemAlign="center" className="oui-gap-[2px]">
        <Text
          size="2xs"
          intensity={36}
          weight="regular"
          className="oui-leading-[10px]"
        >
          {t("transfer.depositCap", "Deposit cap")}{" "}
          <Text.numeral
            as="span"
            size="2xs"
            intensity={80}
            weight="regular"
            className="oui-leading-[10px]"
            dp={0}
          >
            {userMaxQty ?? 0}
          </Text.numeral>
        </Text>
        {isMobile ? (
          <button
            type="button"
            className="oui-flex oui-items-center"
            onClick={handleInfoClick}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <InfoCircleIcon
              className="oui-size-3 oui-shrink-0 oui-cursor-pointer"
              opacity={0.36}
            />
          </button>
        ) : (
          <Tooltip
            content={
              <Box
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {renderDepositCapTooltipContent()}
              </Box>
            }
          >
            <InfoCircleIcon
              className="oui-size-3 oui-shrink-0 oui-cursor-pointer"
              opacity={0.36}
            />
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
};

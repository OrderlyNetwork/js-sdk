import { FC } from "react";
import {
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Divider,
  Flex,
  inputFormatter,
  modal,
  Text,
  TextField,
  Tooltip,
} from "@orderly.network/ui";
import { AsTraderReturns } from "./asTrader.script";
import { USDCIcon } from "../../../components/usdcIcon";
import { ArrowRightIcon } from "../../../components/arrowRightIcon";
import { commifyOptional } from "@orderly.network/utils";
import { useTranslation } from "@orderly.network/i18n";

export const AsTrader: FC<AsTraderReturns> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex
      id="oui-affiliate-home-asTrader"
      gradient="success"
      r={"2xl"}
      p={6}
      gap={6}
      direction={"column"}
      angle={180}
      width={"100%"}
      justify={"between"}
    >
      <Flex
        height={80}
        direction={"row"}
        gap={3}
        itemAlign={"start"}
        width={"100%"}
        justify={"between"}
      >
        <Flex
          direction={"column"}
          itemAlign={"start"}
          justify={"between"}
          className="oui-h-full"
        >
          <Text className="oui-text-lg md:oui-text-xl lg:oui-text-2xl xl:oui-text-3xl">
            {props.isTrader
              ? t("affiliate.trader")
              : t("affiliate.asTrader.title")}
          </Text>
          <Text
            className={cn(
              "oui-text-xs md:oui-text-sm 2xl:oui-text-base oui-text-base-contrast-54",
              props.isTrader && "oui-hidden"
            )}
          >
            {t("affiliate.asTrader.description")}
          </Text>
        </Flex>
        <div className="oui-flex-shrink-0">
          <Icon />
        </div>
      </Flex>
      <Bottom {...props} />
    </Flex>
  );
};

const Icon = () => {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="xl:oui-w-[90px] xl:oui-h-[90px] "
    >
      <path
        d="M44.996 7.324c-20.71 0-37.43 16.79-37.5 37.5-.07 20.682 16.806 37.575 37.5 37.617 20.694.04 37.537-17.082 37.5-37.617-.037-20.71-16.79-37.5-37.5-37.5m0 7.5c16.569 0 30 13.433 30 30 0 8.438-3.514 16.043-9.12 21.495-2.762-5.973-8.694-10.245-15.49-10.245h-10.78c-6.791 0-12.706 4.22-15.47 10.197-5.606-5.453-9.14-13.01-9.14-21.447 0-16.567 13.431-30 30-30m0 7.5c-8.284 0-15 6.717-15 15s6.716 15 15 15 15-6.716 15-15-6.716-15-15-15"
        fill="#fff"
        fillOpacity=".2"
      />
      <path
        d="M90 71.25C90 81.605 81.605 90 71.25 90S52.5 81.605 52.5 71.25 60.895 52.5 71.25 52.5 90 60.895 90 71.25"
        fill="#005A4F"
      />
      <path
        d="M80.62 75.007c0-.24-.08-.49-.263-.675l-3.487-3.456-1.318 1.318 1.845 1.875H63.745a.938.938 0 0 0 0 1.875h13.652l-1.845 1.875 1.318 1.318 3.487-3.456a.95.95 0 0 0 .263-.674m-.937-7.5a.94.94 0 0 0-.938-.938H65.093l1.846-1.875-1.319-1.318-3.486 3.456a.966.966 0 0 0 0 1.349l3.486 3.456 1.319-1.318-1.846-1.875h13.652c.518 0 .938-.42.938-.937"
        fill="#fff"
        fillOpacity=".98"
      />
    </svg>
  );
};

const Bottom: FC<AsTraderReturns> = (props) => {
  const { t } = useTranslation();

  const content = () => {
    if (props.isTrader && !props.wrongNetwork) {
      const totalReferrerRebate =
        props.referralInfo?.referee_info?.total_referee_rebate;

      return (
        <>
          <Flex direction={"column"} itemAlign={"start"} gap={2}>
            <Text className="oui-text-2xs md:oui-text-xs xl:oui-text-sm">
              {t("affiliate.commission")} {<Text intensity={36}>(USDC)</Text>}
            </Text>
            <Flex direction={"row"} gap={1}>
              <USDCIcon />
              <Text className="oui-text-base md:oui-text-lg lg:oui-text-xl xl:oui-text-2xl">
                {commifyOptional(totalReferrerRebate, {
                  fix: 2,
                  fallback: "0",
                })}
              </Text>
            </Flex>
          </Flex>

          <Flex
            direction={"row"}
            gap={1}
            justify={"end"}
            itemAlign={"center"}
            className="oui-cursor-pointer"
            onClick={(e) => {
              props?.onEnterTraderPage?.();
            }}
          >
            <Text className="oui-text-sm md:oui-text-base xl:oui-text-lg">
              {t("affiliate.enter")}
            </Text>
            <ArrowRightIcon className="md:oui-w-[18px] md:oui-h-[18px] lg:oui-w-[20px] lg:oui-h-[20px] xl:oui-w-[24px] xl:oui-h-[24px]" />
          </Flex>
        </>
      );
    }

    return (
      <>
        <EntryCode {...props} />
        <Flex
          direction={"column"}
          justify={"between"}
          className="oui-h-full"
          itemAlign={"end"}
        >
          <Text className="oui-text-base md:oui-text-lg lg:oui-text-xl 2xl:oui-text-2xl">
            0%~20%
          </Text>
          <Text className="oui-text-2xs md:oui-text-xs 2xl:oui-text-sm oui-text-base-contrast-54">
            {t("affiliate.trader.rebate")}
          </Text>
        </Flex>
      </>
    );
  };

  return (
    <Flex
      direction={"row"}
      justify={"between"}
      width={"100%"}
      itemAlign={"end"}
    >
      {content()}
    </Flex>
  );
};

const EntryCode: FC<AsTraderReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogTrigger>
        <Tooltip
          content={
            props.wrongNetwork
              ? t("connector.wrongNetwork.tooltip")
              : t("affiliate.connectWallet.tooltip")
          }
        >
          {props.isMobile ? (
            <Button
              variant="contained"
              color="light"
              onClick={(event) => {
                if (!props.isSignIn || props.wrongNetwork) {
                  event.stopPropagation();
                  event.preventDefault();
                  modal.alert({
                    title: t("common.tips"),
                    message: (
                      <Text intensity={54}>
                        {props.wrongNetwork
                          ? t("connector.wrongNetwork.tooltip")
                          : t("affiliate.connectWallet.tooltip")}
                      </Text>
                    ),
                  });
                }
              }}
              className={
                !props.isSignIn || props.wrongNetwork
                  ? "oui-bg-white/[.54] oui-text-black/[.36] hover:oui-bg-white/[.54]"
                  : undefined
              }
            >
              {t("affiliate.asTrader.button")}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="light"
              disabled={!props.isSignIn || props.wrongNetwork}
            >
              {t("affiliate.asTrader.button")}
            </Button>
          )}
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="oui-w-[320px] oui-font-semibold">
        <DialogHeader>
          <DialogTitle>{t("affiliate.referralCode.dialog.title")}</DialogTitle>
        </DialogHeader>
        <Divider />
        <DialogBody>
          <Text size="sm" intensity={54}>
            {t("affiliate.referralCode.dialog.description")}
          </Text>

          <TextField
            className="oui-w-full oui-mt-4"
            placeholder={t("affiliate.referralCode")}
            value={props.code}
            onChange={(e) => {
              props.setCode(e.target.value);
            }}
            formatters={[
              inputFormatter.createRegexInputFormatter(/[^A-Z0-9]/g),
            ]}
            onClean={() => {
              props.setCode("");
            }}
            label={t("affiliate.referralCode.label")}
            classNames={{
              label: "oui-text-2xs oui-text-base-contrast-54",
            }}
            helpText={
              !props.isExist && !props.isLoading && props.code.length > 0
                ? t("affiliate.referralCode.notExist")
                : undefined
            }
            color={
              !props.isExist && !props.isLoading && props.code.length > 0
                ? "danger"
                : undefined
            }
          />

          <Flex
            itemAlign={"center"}
            width={"100%"}
            direction={"row"}
            justify={"center"}
            mt={6}
          >
            <Button
              variant="contained"
              color="primary"
              size="md"
              className="oui-px-[40px]"
              disabled={props.code.length < 4 || !props.isExist}
              onClick={(e) => {
                e.stopPropagation();
                props.onClickConfirm();
              }}
            >
              {t("common.confirm")}
            </Button>
          </Flex>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

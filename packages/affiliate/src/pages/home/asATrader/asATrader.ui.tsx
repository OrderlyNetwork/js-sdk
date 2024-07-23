import { FC, useState } from "react";
import {
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Divider,
  Flex,
  Input,
  inputFormatter,
  Text,
  TextField,
  Tooltip,
} from "@orderly.network/ui";
import { AsATraderReturns } from "./asATrader.script";
import { USDCIcon } from "../../../components/usdcIcon";
import { ArrowRightIcon } from "../../../components/arrowRightIcon";
import { AuthGuard } from "@orderly.network/ui-connector";
import { useCheckReferralCode, useMutation } from "@orderly.network/hooks";

export const AsATraderUI: FC<AsATraderReturns> = (props) => {
  return (
    <Flex
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
            {props.isTrader ? "Trader" : "As a Trader"}
          </Text>
          <Text
            className={cn(
              "oui-text-xs md:oui-text-sm 2xl:oui-text-base oui-text-base-contrast-54",
              props.isTrader && "oui-hidden"
            )}
          >
            Onboard traders to earn passive income
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

const Bottom: FC<AsATraderReturns> = (props) => {
  const content = () => {
    if (props.isLoading) {
      return <></>;
    }

    if (props.isTrader) {
      const totalReferrerRebate =
        props.referralInfo?.referee_info?.total_referee_rebate;

      return (
        <>
          <Flex direction={"column"} itemAlign={"start"} gap={2}>
            <Text className="oui-text-2xs md:oui-text-xs xl:oui-text-sm">
              Commission {<Text intensity={36}>(USDC)</Text>}
            </Text>
            <Flex direction={"row"} gap={1}>
              <USDCIcon />
              <Text.numeral
                rule="human"
                className="oui-text-base md:oui-text-lg lg:oui-text-xl xl:oui-text-2xl"
              >
                {totalReferrerRebate || "-"}
              </Text.numeral>
            </Flex>
          </Flex>

          <Flex
            direction={"row"}
            gap={1}
            justify={"end"}
            itemAlign={"center"}
            className="oui-cursor-pointer"
            onClick={(e) => {
              props?.onEnterTraderPage?.(props.referralInfo);
            }}
          >
            <Text className="oui-text-sm md:oui-text-base xl:oui-text-lg">
              Enter
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
            Rebate
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

const EntryCode: FC<AsATraderReturns> = (props) => {
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);

  const {
    isExist,
    error: checkCodeError,
    isLoading,
  } = useCheckReferralCode(code);
  const hide = () => {
    setOpen(false);
  };

  const [bindCode, { error, isMutating }] = useMutation(
    "/v1/referral/bind",
    "POST"
  );

  const onClickConfirm = async () => {
    try {
      await bindCode({ referral_code: code });
      // toast.success("Referral code bound");
      // mutate();
      if (props.bindReferralCodeState) {
        props.bindReferralCodeState(true, null, hide, { tab: 1 });
      } else {
        hide();
      }
    } catch (e: any) {
      let errorText = `${e}`;
      if ("message" in e) {
        errorText = e.message;
      }

      if ("referral code not exist" === errorText) {
        errorText = "This referral code does not exist";
      }

      if (props.bindReferralCodeState) {
        // toast.error(errorText);
        props.bindReferralCodeState(false, e, hide, {});
      } else {
        // toast.error(errorText);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Tooltip content={"Please connect your wallet to use this function"}>
          <Button
            variant="contained"
            color="light"
            disabled={!props.isSignIn}
          >
            Enter code
          </Button>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="oui-w-[320px] oui-font-semibold">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <Divider />
        <DialogBody>
          <Text size="sm" intensity={54}>
            Bind a referral code to earn trading fee rebates.
          </Text>

          <TextField
            className="oui-w-full oui-mt-4"
            placeholder="Referral code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            formatters={[
              inputFormatter.createRegexInputFormatter(/[^A-Z0-9]/g),
            ]}
            onClean={() => {
              setCode("");
            }}
            label={"Enter referral code"}
            classNames={{
              label: "oui-text-2xs oui-text-base-contrast-54",
            }}
            helpText={!isExist && !isLoading ? "This referral code does not exist." : undefined}
            color="danger"
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
              disabled={code.length < 4 || !isExist}
              onClick={(e) => {
                e.stopPropagation();
                onClickConfirm();
              }}
            >
              Confirm
            </Button>
          </Flex>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

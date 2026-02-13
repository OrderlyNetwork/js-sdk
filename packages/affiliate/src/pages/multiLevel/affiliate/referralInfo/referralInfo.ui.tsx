import { FC } from "react";
import { Trans, useTranslation } from "@orderly.network/i18n";
import { Flex, Text, Button, Box, cn, toast } from "@orderly.network/ui";
import { GiftIcon } from "../../../../icons/giftIcon";
import { ReferralCodeFormField } from "../../../../types";
import { ReferralInfoReturns } from "./referralInfo.script";

export const ReferralInfo: FC<ReferralInfoReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      id="oui-affiliate-affiliate-referralLink"
      r={"2xl"}
      width={"100%"}
      height={"100%"}
      gap={4}
      p={5}
      direction={"column"}
      intensity={900}
      className="oui-border oui-border-line-6"
    >
      <Flex direction={"row"} justify={"between"} width={"100%"}>
        <Text size="lg">{t("affiliate.referral")}</Text>
        <Button
          size="xs"
          color="secondary"
          onClick={() => props.onEdit(ReferralCodeFormField.ReferralCode)}
        >
          {t("affiliate.configure")}
        </Button>
      </Flex>

      <Container className="oui-flex-col oui-items-start oui-gap-4 oui-p-5">
        <Flex
          r="full"
          px={2}
          height={20}
          justify={"center"}
          itemAlign={"center"}
          className="oui-border oui-border-primary-light"
        >
          <Text intensity={98} className="oui-text-[10px] oui-leading-[10px]">
            {t("affiliate.multiLevel")}
          </Text>
        </Flex>
        <Flex direction={"row"} justify={"between"} width={"100%"}>
          <Text size="lg" color="primaryLight">
            {props.referralCode}
          </Text>
          <CopyButton value={props.referralCode} />
        </Flex>
      </Container>

      <Container className="oui-p-5">
        <Text size="lg" color="primaryLight">
          {props.referralLink}
        </Text>
        <CopyButton value={props.referralLink} />
      </Container>

      <Box
        width={"100%"}
        r="2xl"
        className="oui-bg-base-contrast-4 oui-p-5 md:oui-py-7"
      >
        <Flex direction={"row"} justify={"between"} width={"100%"}>
          <Text size="sm">{t("affiliate.revenueSplitStrategy")}</Text>
          <Button size="xs" color="secondary" onClick={() => props.onEdit()}>
            {t("common.edit")}
          </Button>
        </Flex>

        <Flex justify={"between"} width={"100%"} mt={4}>
          <Text size="sm" intensity={54}>
            {t("affiliate.youKeep")}
          </Text>
          <Text size="sm" intensity={54}>
            {t("affiliate.refereesGet")}
          </Text>
        </Flex>

        <Flex justify={"between"} width={"100%"} mt={2}>
          <Text.formatted size="3xl" intensity={80}>
            {props.referrerRebateRate}%
          </Text.formatted>
          <Text.formatted size="3xl" intensity={36}>
            {props.refereeRebateRate}%
          </Text.formatted>
        </Flex>

        {props.directBonusRebateRate > 0 && (
          <Flex gap={2} mt={4} width={"100%"} className="oui-items-center">
            <GiftIcon
              size={16}
              className="oui-shrink-0 oui-text-base-contrast oui-mt-[1px]"
            />
            <Text
              intensity={54}
              as="span"
              className="oui-flex-1 oui-min-w-0 oui-tracking-[0.03em]"
            >
              <Trans
                i18nKey="affiliate.extraBonusOnDirectReferrals"
                values={{ amount: props.directBonusRebateRate }}
                components={[<Text as="span" color="primaryLight" key="0" />]}
              />
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

const Container: FC<{
  children: React.ReactNode;
  className?: string;
}> = (props) => {
  return (
    <Flex
      width={"100%"}
      justify={"between"}
      px={5}
      r="2xl"
      className={cn("oui-bg-base-contrast-4", props.className)}
    >
      {props.children}
    </Flex>
  );
};

const CopyButton: FC<{
  value?: string;
}> = (props) => {
  const { t } = useTranslation();

  const onCopy = () => {
    if (!props.value) return;
    navigator.clipboard.writeText(props.value);
    toast.success(t("common.copy.copied"));
  };

  return (
    <Button size="xs" color="secondary" onClick={onCopy}>
      {t("common.copy")}
    </Button>
  );
};

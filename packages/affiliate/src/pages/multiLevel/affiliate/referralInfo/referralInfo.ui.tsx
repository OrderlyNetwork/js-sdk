import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text, Button, Box, cn, toast } from "@orderly.network/ui";
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
          {t("affiliate.referralCodes.edit")}
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
        className="oui-bg-base-contrast-4 oui-p-5 md:oui-py-13"
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
            {t("affiliate.inviteesGet")}
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

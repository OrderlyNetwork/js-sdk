import { FC, useEffect, useRef, useState } from "react";
import { Button, Card, CopyIcon, Flex, Text } from "@orderly.network/ui";
import { ReferralLinkReturns } from "./referralLink.script";
import { InfoIcon } from "../../../components/infoIcon";
import { AutoHideText } from "../../../components/autoHideText";

export const ReferralLinkUI: FC<ReferralLinkReturns> = (props) => {
  return (
    <Flex
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
    >
      <Title {...props} />
      <Subtitle {...props} />
      <Input title="Referral code" value={props.refCode} {...props} />
      <Input title="Referral link" value={props.refLink} {...props} />
    </Flex>
  );
};

const Title: FC<ReferralLinkReturns> = (props) => {
  return (
    <Flex direction={"row"} justify={"between"} width={"100%"}>
      <Text className="oui-text-lg">Referral link</Text>
    </Flex>
  );
};

const Subtitle: FC<ReferralLinkReturns> = (props) => {
  const item = (
    title: string,
    value: string,
    gradient: boolean,
    className?: string
  ) => {
    const valueClsName =
      "oui-text-lg md:oui-text-xl lg:oui-text-2xl xl:oui-text-3xl";
    return (
      <Flex direction={"column"} itemAlign={"start"} className={className}>
        <Flex direction={"row"} gap={2}>
          <Text>{title}</Text>
          <InfoIcon />
        </Flex>
        {gradient ? (
          <Text.gradient color="brand" className={valueClsName}>
            {value}
          </Text.gradient>
        ) : (
          <Text className={valueClsName}>{value}</Text>
        )}
      </Flex>
    );
  };

  return (
    <Flex direction={"row"} width={"100%"}>
      {item("Earn", "40%", true, "oui-flex-1")}
      {item("Share", "40%", false, "oui-flex-1")}
    </Flex>
  );
};

const Input: FC<
  ReferralLinkReturns & {
    title: string;
    value: string;
  }
> = (props) => {
  const { title, value } = props;
  return (
    <Flex
      r="xl"
      p={3}
      gap={4}
      direction={"row"}
      width={"100%"}
      className="oui-bg-base-8"
    >
      <Text className="oui-text-base-contrast-54 oui-flex-shrink">{title}</Text>
      <Flex direction={"row"} justify={"end"} gap={2} className="oui-flex-1">
        <AutoHideText text={value} />
        <button
          className="oui-cursor-pointer oui-text-sm oui-flex-shrink"
          onClick={() => {
            navigator.clipboard.writeText(value);
            props.onCopy?.(value);
          }}
        >
          <CopyIcon size={12} color="white" />
        </button>
      </Flex>
    </Flex>
  );
};

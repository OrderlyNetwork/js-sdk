import { FC } from "react";
import {
  CopyIcon,
  Divider,
  Flex,
  modal,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { ReferralLinkReturns } from "./referralLink.script";
import { InfoIcon } from "../../../components/infoIcon";
import { AutoHideText } from "../../../components/autoHideText";
import { GradientText } from "../../../components/gradientText";

export const ReferralLink: FC<ReferralLinkReturns> = (props) => {
  return (
    <Flex
      id="oui-affiliate-affiliate-referralLink"
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
    >
      <Title {...props} />
      <Flex
        width={"100%"}
        className="oui-flex oui-flex-col 3xl:oui-flex-row"
        gap={4}
      >
        <div className="oui-w-full 3xl:oui-w-1/3">
          <Subtitle {...props} />
        </div>
        <Flex direction={"column"} width={"100%"} className="3xl:oui-w-2/3">
          <Input title="Referral code" value={props.refCode} {...props} />
          <Input title="Referral link" value={props.refLink} {...props} />
        </Flex>
      </Flex>
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
    className?: string,
    tooltip?: any
  ) => {
    const valueClsName =
      "oui-text-lg md:oui-text-xl lg:oui-text-2xl xl:oui-text-3xl";
    return (
      <Flex direction={"column"} itemAlign={"start"} className={className}>
        <Flex direction={"row"} gap={2}>
          {/* <Text>{title}</Text> */}
          <Alert title={title} tooltip={tooltip} />
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
      {item(
        "Earn",
        props.earn || "-",
        true,
        "oui-flex-1",
        <GradientText
          texts={[
            { text: props.earn || "-", gradient: true, gradientColor: "brand" },
            { text: ` ${props.brokerName} net fee that deduct Orderly fee.` },
          ]}
        />
      )}
      {item(
        "Share",
        props.share || "-",
        false,
        "oui-flex-1",
        <GradientText
          texts={[
            { text: "Your referees get " },
            {
              text: props.share || "-",
              gradient: true,
              gradientColor: "brand",
            },
            { text: ` of their ${props.brokerName} net fee` },
          ]}
        />
      )}
    </Flex>
  );
};

const Input: FC<
  ReferralLinkReturns & {
    title: string;
    value?: string;
  }
> = (props) => {
  const { title, value = "-" } = props;
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

const Alert: FC<{
  title: string;
  tooltip: any;
}> = (props) => {
  return (
    <Tooltip content={props.tooltip} className="oui-max-w-[200px]">
      <div
        onClick={() => {
          modal.alert({
            title: props.title,
            message: (
              <div className="oui-text-base-contrast/30 oui-space-y-3 oui-text-xs desktop:oui-text-xs">
                {props.tooltip}
              </div>
            ),
          });
        }}
      >
        <Flex direction={"column"}>
          <Text intensity={54}>{props.title}</Text>
          <Divider className="oui-w-full" lineStyle="dotted" intensity={16}/>
        </Flex>
      </div>
    </Tooltip>
  );
};

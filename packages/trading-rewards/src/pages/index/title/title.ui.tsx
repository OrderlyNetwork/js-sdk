import { Divider, Flex, Text } from "@orderly.network/ui";
import { FC } from "react";
import { TitleConfig } from "./title.script";

export const Title: FC<TitleConfig> = (props) => {
  const {
    title,
    subtitle,
    content,
    docOpenOptions,
  } = props;
  return (
    <Flex
      id="oui-trading-rewards-home-title"
      p={6}
      direction={"column"}
      itemAlign={"start"}
      gap={4}
      className="oui-bg-base-9 oui-font-semibold"
      r={"2xl"}
      width={"100%"}
    >
      {title || <Text size="lg">Trading Rewards</Text>}
      <Divider />
      <Flex direction={"column"} itemAlign={"start"} gap={1}>
        {subtitle || (
          <Text size="base">{`Trade with ${props.brokerName} to earn rewards.`}</Text>
        )}

        {content || <MultiLineText docOpenOptions={docOpenOptions} />}
      </Flex>
    </Flex>
  );
};

const MultiLineText: FC<{
  docOpenOptions?: {
    url?: string;
    target?: string;
    features?: string;
  };
}> = (props) => {
  const clickableParts = [
    {
      content: "Learn more here",
      isLink: true,
    },
    // {
    //   content: "about Orderly Trading Rewards Program.",
    //   isLink: false,
    // },
    // {
    //   content: "Trading Rewards Docs",
    //   isLink: true,
    // },
  ];
  const renderText = () => {
    return clickableParts.map((item, index) => {
      return (
        <span
          key={index}
          className={`${item.isLink ? "oui-text-primary-light oui-cursor-pointer" : ""}`}
          dangerouslySetInnerHTML={{ __html: item.content }}
          onClick={() => [
            window.open(
              props.docOpenOptions?.url,
              props.docOpenOptions?.target,
              props.docOpenOptions?.features
            ),
          ]}
        />
      );
    });
  };

  return (
    <div className="oui-text-sm oui-text-base-contrast-54 oui-font-normal">{renderText()}</div>
  );
};

export default MultiLineText;

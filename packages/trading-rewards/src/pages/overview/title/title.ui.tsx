import { Box, Card, Divider, Flex, Text } from "@orderly.network/ui";
import { FC, ReactNode } from "react";

export const TitleUI: FC<{
  /// default is `Trading Rewards`
  title?: string | ReactNode;
  /// default is `Trade with Orderly’s brokers to earn rewards.`
  subtitle?: string | ReactNode;
  /// default is `Learn more about Orderly Trading Rewards Program in Trading Rewards Docs`
  content?: string | ReactNode;
  /// default is { url: 'https://orderly.network/docs/introduction/tokenomics/trading-rewards', target: "_blank"}
  docOpenOptions?: {
    url?: string;
    target?: string;
    features?: string;
  };
}> = (props) => {
  const {
    title,
    subtitle,
    content,
    docOpenOptions = {
      url: "https://orderly.network/docs/introduction/tokenomics/trading-rewards",
      target: "_blank",
    },
  } = props;
  return (
    <Flex
      p={6}
      direction={"column"}
      itemAlign={"start"}
      gap={4}
      className="oui-bg-base-9"
      r={"2xl"}
      width={"100%"}
    >
      {title || <Text size="lg">Trading Rewards</Text>}
      <Divider />
      <Flex direction={"column"} itemAlign={"start"} gap={1}>
        {subtitle || (
          <Text size="base">Trade with Orderly’s brokers to earn rewards.</Text>
        )}

        {content || <MultiLineText docOpenOptions={docOpenOptions} />}
      </Flex>
    </Flex>
  );
};

const MultiLineText: FC<{
  docOpenOptions: {
    url?: string;
    target?: string;
    features?: string;
  };
}> = (props) => {
  const clickableParts = [
    {
      content: "Learn more about Orderly Trading Rewards Program in ",
      isLink: false,
    },
    {
      content: "Trading Rewards Docs",
      isLink: true,
    },
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
              props.docOpenOptions.url,
              props.docOpenOptions.target,
              props.docOpenOptions.features
            ),
          ]}
        />
      );
    });
  };

  return (
    <div className="oui-text-sm oui-text-base-contrast-54">{renderText()}</div>
  );
};

export default MultiLineText;

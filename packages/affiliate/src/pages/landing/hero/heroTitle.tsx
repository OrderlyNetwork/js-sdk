import { Flex, Text } from "@orderly.network/ui";

export const HeroTitle = () => {
  return (
    <Flex
      direction="column"
      gap={3}
      itemAlign="start"
      id="oui-affiliate-landing-hero-title"
    >
      <Text
        weight="semibold"
        className="oui-text-[32px] md:oui-text-[48px] oui-leading-tight"
      >
        Build your revenue network, earn lifetime commissions
      </Text>
    </Flex>
  );
};

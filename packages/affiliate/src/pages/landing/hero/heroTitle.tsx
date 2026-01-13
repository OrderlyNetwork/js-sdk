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
      <Text size="sm" intensity="54">
        Trade 10,000 USDC volume to unlock the ability to invite friends and
        earn commissions.
      </Text>
    </Flex>
  );
};

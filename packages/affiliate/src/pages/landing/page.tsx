import { Flex } from "@orderly.network/ui";
import { FaqWidget } from "./faq";
import { HeroWidget } from "./hero";
import { HowItWorksWidget } from "./howItWorks";

export const LandingPage = () => {
  return (
    <Flex
      id="oui-affiliate-landing-page"
      direction="column"
      gap={10}
      itemAlign={"stretch"}
      className="oui-mx-auto oui-w-full oui-p-5 md:oui-w-[1000px] md:oui-py-12"
    >
      <HeroWidget />
      <HowItWorksWidget />
      <FaqWidget />
    </Flex>
  );
};

import { FC, useState } from "react";
import { useConfig } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, cn, useScreen, Divider } from "@orderly.network/ui";
import { ChevronDownIcon } from "@orderly.network/ui";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: FC<FAQItemProps> = ({ question, answer }) => {
  const { isMobile } = useScreen();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Flex
      onClick={() => setIsOpen(!isOpen)}
      direction="column"
      className="oui-w-full"
      itemAlign={"start"}
    >
      <Flex
        gap={4}
        className="oui-w-full oui-cursor-pointer hover:oui-opacity-80 oui-transition-opacity"
      >
        <Text
          className={cn(
            "oui-flex-1 oui-text-white oui-font-semibold oui-tracking-[0.03em]",
            isMobile
              ? "oui-text-lg oui-leading-[26px]"
              : "oui-text-xl oui-leading-8",
          )}
        >
          {question}
        </Text>
        <ChevronDownIcon
          size={24}
          className={cn(
            "oui-text-white oui-transition-transform oui-duration-300 oui-flex-shrink-0",
            isOpen && "oui-rotate-180",
          )}
        />
      </Flex>
      <Box
        className={cn(
          "oui-overflow-hidden oui-transition-all oui-duration-300",
          isOpen && "oui-mt-4",
        )}
        style={{
          maxHeight: isOpen ? "500px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <Text
          className="oui-text-base-contrast-54 oui-text-sm oui-leading-relaxed"
          style={{ whiteSpace: "pre-line" }}
        >
          {answer}
        </Text>
      </Box>
    </Flex>
  );
};

interface FAQSectionProps {
  className?: string;
}

export const FAQSection: FC<FAQSectionProps> = ({ className }) => {
  const brokerName = useConfig("brokerName");
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const faqData = [
    {
      question: t("tradingPoints.faq.whatArePoints.question"),
      answer: t("tradingPoints.faq.whatArePoints.answer", { brokerName }),
    },
    {
      question: t("tradingPoints.faq.allocation.question"),
      answer: t("tradingPoints.faq.allocation.answer"),
    },
    {
      question: t("tradingPoints.faq.distribution.question"),
      answer: t("tradingPoints.faq.distribution.answer"),
    },
    {
      question: t("tradingPoints.faq.pnl.question"),
      answer: t("tradingPoints.faq.pnl.answer"),
    },
    {
      question: t("tradingPoints.faq.referral.question"),
      answer: t("tradingPoints.faq.referral.answer"),
    },
  ];

  return (
    <Flex
      direction="column"
      gap={6}
      className={className}
      itemAlign={"start"}
      id="points-faq"
    >
      <Text
        className={cn(
          "oui-text-base-contrast oui-font-normal oui-tracking-[0.03em]",
          isMobile
            ? "oui-text-2xl oui-leading-8"
            : "oui-text-3xl oui-leading-10",
        )}
      >
        {t("tradingPoints.faq.title")}
      </Text>
      <Flex
        direction="column"
        gap={8}
        className="oui-w-full"
        itemAlign={"start"}
      >
        {faqData.map((faq, index) => (
          <div key={index} className="oui-w-full">
            <FAQItem question={faq.question} answer={faq.answer} />
            {index < faqData.length - 1 && (
              <Divider className="oui-mt-8" intensity={8} />
            )}
          </div>
        ))}
      </Flex>
    </Flex>
  );
};

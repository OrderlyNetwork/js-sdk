import React, { FC } from "react";
import {
  Flex,
  Text,
  Collapsible,
  CollapsibleContent,
  Box,
} from "@orderly.network/ui";
import type { FaqState } from "./faq.script";

export type FaqProps = FaqState & {};

export const Faq: FC<FaqProps> = (props) => {
  const { faqItems, toggleItem } = props;

  return (
    <Box>
      {/* Title */}
      <Text className="oui-text-[32px]">FAQ</Text>

      {/* FAQ Items */}
      <Flex direction="column" itemAlign="stretch" gap={0}>
        {faqItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <Collapsible
              open={item.expanded}
              onOpenChange={() => toggleItem(item.id)}
            >
              <Flex
                direction="column"
                className="oui-cursor-pointer oui-py-4"
                itemAlign="stretch"
                onClick={() => toggleItem(item.id)}
              >
                {/* Question row */}
                <Flex justify="between" itemAlign="center" gap={4}>
                  <Flex gap={2} itemAlign="center" className="oui-flex-1">
                    <Text size="2xl" weight="semibold">
                      {`${item.number}. ${item.question}`}
                    </Text>
                  </Flex>
                  <ChevronIcon expanded={item.expanded} />
                </Flex>

                {/* Answer (collapsible) */}
                <CollapsibleContent>
                  <Flex className="oui-pl-6 oui-pt-3">
                    <Text>{item.answer}</Text>
                  </Flex>
                </CollapsibleContent>
              </Flex>
            </Collapsible>

            {/* Divider (except for last item) */}
            {index < faqItems.length - 1 && (
              <div className="oui-my-4 oui-h-px oui-bg-line-6" />
            )}
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
};

// Chevron icon component
const ChevronIcon: FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`oui-transition-transform oui-duration-200 ${
      expanded ? "oui-rotate-180" : ""
    }`}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="oui-text-base-contrast-54"
    />
  </svg>
);

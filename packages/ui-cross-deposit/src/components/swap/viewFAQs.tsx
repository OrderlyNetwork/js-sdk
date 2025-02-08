import React from "react";
import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";

export const ViewFAQs: FC = () => {
  return (
    <Flex justify="center" gapX={1} mt={3}>
      <Text size="xs" intensity={54}>
        Need help?
      </Text>
      <Text
        size="xs"
        color="primaryLight"
        onClick={() => {
          window.open("https://learn.woo.org/woofi/faqs/woofi-pro");
        }}
        className="oui-cursor-pointer"
      >
        View FAQs
      </Text>
    </Flex>
  );
};

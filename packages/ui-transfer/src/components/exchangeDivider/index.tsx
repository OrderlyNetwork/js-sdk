import React, { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { ArrowDownIcon } from "../../icons";

export const ExchangeDivider: FC = () => {
  return (
    <Flex height={40}>
      <Flex height={1} className="oui-bg-base-contrast-12 oui-flex-1"></Flex>
      <ArrowDownIcon className="oui-text-primary-light" />
      <Flex height={1} className="oui-bg-base-contrast-12 oui-flex-1"></Flex>
    </Flex>
  );
};

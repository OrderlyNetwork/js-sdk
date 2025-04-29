import { cn } from "@orderly.network/ui";

import { Flex } from "@orderly.network/ui";
import { ProductItem } from "./productItem";
import { useState } from "react";
import { useTrack } from "@orderly.network/hooks";
import { EnumTrackerKeys, TrackerListenerKeyMap } from "@orderly.network/types";

export function CustomProductNav() {
  const items = [
    { name: "Swap", href: "/swap" },
    { name: "Perps", href: "/perps" },
  ];
  const {track} = useTrack();
  const [currentItem, setCurrentItem] = useState<string>("/perps");

  const onItemClick = (item: ProductItem) => {
    if (item.href === "/swap") {
      // swap url
      track(EnumTrackerKeys.trackBrokerEvent, { eventName: 'portfolio_fee_tier_click_stake_woo'})

      // track(EnumTrackerKeys.trackBrokerEvent, { eventName: 'sign_message_success'})
      // track(EnumTrackerKeys.clickLinkDeviceButton, {'test': 'test', eventName: 'portfolio_fee_tier_click_stake_woo'})
      // window.open("https://app.orderly.network", "_blank");
      return;
    }
  };

  return (
    <Flex gap={0} border r="md" className={cn("oui-p-[1px]")} borderColor={12}>
      {items?.map((product, index) => {
        return (
          <ProductItem
            key={index}
            item={product}
            onClick={onItemClick}
            active={currentItem == product.href}
          />
        );
      })}
    </Flex>
  );
}

import React from "react";
import { OrdersModule } from "@orderly.network/portfolio";
import { Box } from "@orderly.network/ui";
import { tradingPageConfig } from "../../../../orderlyConfig";

export default function OrdersPage() {
  return (
    <Box
      p={6}
      pb={0}
      intensity={900}
      r="xl"
      width="100%"
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        height: "calc(100vh - 48px - 29px - 48px)",
      }}
    >
      <OrdersModule.OrdersPage
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
      />
    </Box>
  );
}

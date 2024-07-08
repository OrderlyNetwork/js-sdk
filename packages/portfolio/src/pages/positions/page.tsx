import { Box, Divider } from "@orderly.network/ui";
import { PositionsWidget } from "@orderly.network/ui-positions";

export const PositionsPage = () => {
  return (
    <>
      <h3>Positions</h3>
      <Divider className="oui-my-4" />
      <Box px={3}>
        <PositionsWidget />
      </Box>
    </>
  );
};

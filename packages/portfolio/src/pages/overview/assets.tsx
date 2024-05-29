import {
  Card,
  CardTitle,
  Divider,
  Flex,
  Grid,
  Statistic,
  Text,
} from "@orderly.network/ui";
import { AssetsHeader } from "./assetsHeader";

export const Assets = () => {
  return (
    <Card title={<AssetsHeader />}>
      <Statistic label="Portfolio value">
        <Text.numeral className="oui-text-2xl">123424.22</Text.numeral>
      </Statistic>
      <Divider className="oui-mt-4 oui-mb-4" highlight={3} />
      <Grid cols={3}>
        <Statistic
          label="Unreal. PnL"
          valueProps={{
            coloring: true,
            showIdentifier: true,
          }}
        >
          2312
        </Statistic>
        <Statistic label="Max account leverage">2312</Statistic>
        <Statistic label="Available to withdraw" align="right">
          2312
        </Statistic>
      </Grid>
    </Card>
  );
};

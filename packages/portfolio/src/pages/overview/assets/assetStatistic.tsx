import { EditIcon, Flex, Grid, Statistic } from "@orderly.network/ui";

export const AssetStatistic = () => {
  return (
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
      <Statistic label="Max account leverage">
        <Flex itemAlign={"center"}>
          <span>10</span>
          <span>x</span>
          <button className="oui-ml-1" onClick={() => props.onLeverageEdit?.()}>
            <EditIcon color={"white"} size={18} />
          </button>
        </Flex>
      </Statistic>
      <Statistic label="Available to withdraw" align="right">
        2312
      </Statistic>
    </Grid>
  );
};

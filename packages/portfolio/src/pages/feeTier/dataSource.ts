export const dataSource = [
  {
    tier: 1,
    maker_fee: "0.03%",
    taker_fee: "0.06%",
    volume_min: 0,
    volume_max: 500000,
  },
  {
    tier: 2,
    maker_fee: "0.024%",
    taker_fee: "0.054%",
    volume_min: 500000,
    volume_max: 2500000,
  },
  {
    tier: 3,
    maker_fee: "0.018%",
    taker_fee: "0.048%",
    volume_min: 2500000,
    volume_max: 10000000,
  },
  {
    tier: 4,
    maker_fee: "0.012%",
    taker_fee: "0.042%",
    volume_min: 10000000,
    volume_max: 100000000,
  },
  {
    tier: 5,
    maker_fee: "0.006%",
    taker_fee: "0.036%",
    volume_min: 100000000,
    volume_max: 250000000,
    or: "/",
    staking_min: 300000,
    staking_max: null,
  },
  {
    tier: 6,
    maker_fee: "0%",
    taker_fee: "0.03%",
    volume_min: 250000000,
    volume_max: null,
    or: "/",
    staking: null,
    staking_min: null,
    staking_max: null,
  },
];
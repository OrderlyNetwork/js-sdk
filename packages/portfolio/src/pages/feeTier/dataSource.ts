import type { FeeDataType } from "./feeTier.script";

export const dataSource: FeeDataType[] = [
  {
    tier: 1,
    volume_min: 0,
    volume_max: 500000,
    maker_fee: "0.025%",
    taker_fee: "0.04%",
  },
  {
    tier: 2,
    volume_min: 500000,
    volume_max: 1000000,
    maker_fee: "0.02%",
    taker_fee: "0.035%",
  },
  {
    tier: 3,
    volume_min: 1000000,
    volume_max: 5000000,
    maker_fee: "0.018%",
    taker_fee: "0.03%",
  },
  {
    tier: 4,
    volume_min: 5000000,
    volume_max: 20000000,
    maker_fee: "0.012%",
    taker_fee: "0.025%",
  },
  {
    tier: 5,
    volume_min: 20000000,
    volume_max: 50000000,
    or: "/",
    maker_fee: "0.009%",
    taker_fee: "0.022%",
  },
  {
    tier: 6,
    volume_min: 50000000,
    volume_max: 100000000,
    or: "/",
    maker_fee: "0.005%",
    taker_fee: "0.018%",
  },
  {
    tier: 7,
    volume_min: 100000000,
    volume_max: undefined,
    or: "/",
    maker_fee: "0%",
    taker_fee: "0.015%",
  },
];

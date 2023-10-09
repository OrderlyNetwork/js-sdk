export { Coin } from "./coin";
import { Combine } from "./combine";
import { NetworkImage as BaseNetworkImage } from "./networkImage";
export { SvgImage } from "./svgImage";

type NetworkImageCombine = typeof BaseNetworkImage & {
  combine: typeof Combine;
};

const NetworkImage: NetworkImageCombine =
  BaseNetworkImage as NetworkImageCombine;
NetworkImage.combine = Combine;

export { NetworkImage };

export * from "./icons";

export const isReachedVolumeLimit = (volume: number, volumeLimit: number) => {
  return volume >= volumeLimit;
};

/**
 * Get the highest tier index that the user has reached based on trading volume
 * @param tradingVolume Current trading volume
 * @param tieredPrizePools Array of prize pool tiers with volume limits
 * @returns Highest reached tier index (0-based), or -1 if invalid data or no tiers reached
 */
export const getCurrentTierIndex = (
  tradingVolume: number,
  tieredPrizePools: Array<Array<{ volume_limit?: number }>>,
): number => {
  if (!tieredPrizePools || tieredPrizePools.length === 0) {
    return -1;
  }

  // Extract volume limits and sort them in ascending order
  const volumeLimits = tieredPrizePools
    .map((tier) => tier[0]?.volume_limit || 0)
    .filter((limit) => limit >= 0)
    .sort((a, b) => a - b);

  if (volumeLimits.length === 0) {
    return -1;
  }

  // If trading volume is 0 or negative, no tiers reached
  // if (tradingVolume <= 0) {
  //   return -1;
  // }

  // Find the highest tier that the user has reached
  let highestReachedTier = -1;
  for (let i = 0; i < volumeLimits.length; i++) {
    if (tradingVolume >= volumeLimits[i]) {
      highestReachedTier = i;
    } else {
      break;
    }
  }

  return highestReachedTier;
};

/**
 * Calculate progress bar width percentage based on current trading volume and tiered volume limits
 * @param tradingVolume Current trading volume
 * @param tieredPrizePools Array of prize pool tiers with volume limits
 * @returns Width percentage (0-100)
 */
export const calculateProgressWidth = (
  tradingVolume: number,
  tieredPrizePools: Array<Array<{ volume_limit?: number }>>,
): number => {
  if (!tieredPrizePools || tieredPrizePools.length === 0) {
    return 0;
  }

  // Extract volume limits and sort them in ascending order
  const volumeLimits = tieredPrizePools
    .map((tier) => tier[0]?.volume_limit || 0)
    .filter((limit) => limit >= 0)
    .sort((a, b) => a - b);

  if (volumeLimits.length === 0) {
    return 0;
  }

  // If trading volume is 0 or negative, return 0%
  if (tradingVolume === 0) {
    if (volumeLimits.length === 3) {
      return 19;
    }
    if (volumeLimits.length === 2) {
      return 29;
    }
    return (1 / volumeLimits.length) * 100 - 15;
  }
  // Calculate the width of each segment (equally distributed)
  const segmentWidth = 100 / volumeLimits.length;

  // If trading volume exceeds the highest limit, return 100%
  const maxLimit = volumeLimits[volumeLimits.length - 1];
  if (tradingVolume >= maxLimit) {
    return 100;
  }

  // Find which segment the current volume falls into (not necessarily reached)
  let segmentIndex = 0;
  for (let i = 0; i < volumeLimits.length; i++) {
    if (tradingVolume < volumeLimits[i]) {
      segmentIndex = i;
      break;
    }
  }

  // Calculate progress within the segment
  const segmentStart = segmentIndex === 0 ? 0 : volumeLimits[segmentIndex - 1];
  const segmentEnd = volumeLimits[segmentIndex];
  const segmentRange = segmentEnd - segmentStart;
  const volumeInSegment = tradingVolume - segmentStart;

  // Calculate progress percentage within current segment
  const progressInSegment =
    segmentRange > 0 ? volumeInSegment / segmentRange : 0;

  // Total width = completed segments + progress in current segment
  const totalWidth =
    segmentIndex * segmentWidth + progressInSegment * segmentWidth;

  // Ensure the result is between 0 and 100
  return Math.min(Math.max(totalWidth, 0), 100);
};

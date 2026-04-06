const WAD = 1e18;

const WAD_BI = BigInt("1000000000000000000"); // 1e18
const ONE_THOUSAND_APY_BI = BigInt("76036763191"); // matches InterestLib.ONE_THOUSAND_APY
const AUCTION_DURATION_SECONDS = 24 * 60 * 60; // matches PolyLend.AUCTION_DURATION

export const calculateAmountOwed = (
  loanAmount: bigint | number | string,
  rate: bigint | number | string,
  startTime: number
) => {
  const principal = Number(loanAmount);
  const growthPerSecond = Number(rate) / WAD;

  const now = Math.floor(Date.now() / 1000);
  const durationSeconds = Math.max(0, now - startTime);

  const multiplier = Math.pow(growthPerSecond, durationSeconds);

  return Math.floor(principal * multiplier);
};

export const calculateMaxTransferRate = (
  callTime: bigint | number | string
): bigint => {
  const now = Math.floor(Date.now() / 1000);
  const elapsedSeconds = Math.max(0, now - Number(callTime));
  const boundedElapsed = Math.min(elapsedSeconds, AUCTION_DURATION_SECONDS);

  const increase =
    (BigInt(boundedElapsed) * ONE_THOUSAND_APY_BI) /
    BigInt(AUCTION_DURATION_SECONDS);

  return WAD_BI + increase;
};

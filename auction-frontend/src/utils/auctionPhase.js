// src/utils/auctionPhase.js

export function getTimeValue(value) {
  if (!value) return null;

  let dateValue = value;

  /*
   * Laravel should now return ISO UTC timestamps such as:
   *
   * 2026-10-02T04:08:00.000Z
   *
   * If an old response happens to return a datetime without
   * timezone information, treat it as UTC rather than letting
   * the browser guess.
   */
  if (
    typeof dateValue === "string" &&
    !dateValue.endsWith("Z") &&
    !/[+-]\d{2}:\d{2}$/.test(dateValue)
  ) {
    dateValue = `${dateValue}Z`;
  }

  const time = new Date(dateValue).getTime();

  return Number.isNaN(time) ? null : time;
}

/**
 * Determines the real auction phase.
 *
 * pending = start time has not arrived
 * active  = start time arrived but end time has not arrived
 * closed  = end time has passed
 */
export function getAuctionPhase(
  auction,
  now = Date.now()
) {
  if (!auction) {
    return "unknown";
  }

  const startTime = getTimeValue(
    auction.start_time
  );

  const endTime = getTimeValue(
    auction.end_time
  );

  /*
   * Invalid time data.
   */
  if (
    startTime === null ||
    endTime === null
  ) {
    return "unknown";
  }

  /*
   * END ONLY when the actual end timestamp
   * has passed.
   */
  if (now >= endTime) {
    return "closed";
  }

  /*
   * UPCOMING when start time hasn't arrived.
   */
  if (now < startTime) {
    return "pending";
  }

  /*
   * Between start and end = LIVE.
   */
  return "active";
}

/**
 * Returns true when auction ended within
 * the specified number of hours.
 */
export function isRecentlyEnded(
  auction,
  now = Date.now(),
  hours = 48
) {
  const endTime = getTimeValue(
    auction?.end_time
  );

  if (endTime === null) {
    return false;
  }

  const cutoff =
    now - hours * 60 * 60 * 1000;

  return (
    endTime <= now &&
    endTime >= cutoff
  );
}

/**
 * Returns true when currently live.
 */
export function isAuctionActive(
  auction,
  now = Date.now()
) {
  return (
    getAuctionPhase(auction, now) === "active"
  );
}

/**
 * Returns true when ended.
 */
export function isAuctionEnded(
  auction,
  now = Date.now()
) {
  return (
    getAuctionPhase(auction, now) === "closed"
  );
}

/**
 * Returns true when not started yet.
 */
export function isAuctionPending(
  auction,
  now = Date.now()
) {
  return (
    getAuctionPhase(auction, now) === "pending"
  );
}
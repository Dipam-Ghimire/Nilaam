// src/utils/auctionPhase.js

export function getTimeValue(value) {
  if (!value) return null;

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}

/**
 * Determines the real auction phase from time.
 *
 * closed  = end time has passed
 * pending = start time is in the future
 * active  = currently running
 */
export function getAuctionPhase(auction, now = Date.now()) {
  if (!auction) return 'unknown';

  const startTime = getTimeValue(auction.start_time);
  const endTime = getTimeValue(auction.end_time);

  // Time always wins for an auction that has actually ended.
  if (endTime !== null && endTime <= now) {
    return 'closed';
  }

  // Upcoming auction.
  if (startTime !== null && startTime > now) {
    return 'pending';
  }

  // Respect explicit backend closed states.
  const backendStatus = String(auction.status || '').toLowerCase();

  if (
    backendStatus === 'closed' ||
    backendStatus === 'completed' ||
    backendStatus === 'ended'
  ) {
    return 'closed';
  }

  if (
    backendStatus === 'pending' ||
    backendStatus === 'scheduled' ||
    backendStatus === 'upcoming'
  ) {
    return 'pending';
  }

  return 'active';
}

/**
 * Returns true only when an auction ended within the
 * specified number of hours.
 */
export function isRecentlyEnded(
  auction,
  now = Date.now(),
  hours = 48
) {
  const endTime = getTimeValue(auction?.end_time);

  if (endTime === null) return false;

  const cutoff = now - hours * 60 * 60 * 1000;

  return endTime <= now && endTime >= cutoff;
}

/**
 * Returns true when an auction is currently live.
 */
export function isAuctionActive(auction, now = Date.now()) {
  return getAuctionPhase(auction, now) === 'active';
}

/**
 * Returns true when an auction has ended.
 */
export function isAuctionEnded(auction, now = Date.now()) {
  return getAuctionPhase(auction, now) === 'closed';
}

/**
 * Returns true when an auction has not started yet.
 */
export function isAuctionPending(auction, now = Date.now()) {
  return getAuctionPhase(auction, now) === 'pending';
}
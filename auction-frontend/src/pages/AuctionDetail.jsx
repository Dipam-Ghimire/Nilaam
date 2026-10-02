import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  getAuctionById,
  placeBid,
} from '../api/auctions';

import CountdownTimer from '../components/auction/CountdownTimer';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import { AuthContext } from '../context/AuthContext';

import {
  getAuctionPhase,
} from '../utils/auctionPhase';

const STORAGE_URL = 'http://127.0.0.1:8000/storage';

/*
|--------------------------------------------------------------------------
| Image URL
|--------------------------------------------------------------------------
*/

function getImageUrl(image) {
  if (!image) return null;

  if (typeof image === 'object' && image !== null) {
    image =
      image.image_url ||
      image.url ||
      image.path ||
      image.image ||
      image.src ||
      null;
  }

  if (!image) return null;

  const imageString = String(image).trim();

  if (
    imageString.startsWith('http://') ||
    imageString.startsWith('https://') ||
    imageString.startsWith('data:')
  ) {
    return imageString;
  }

  return `${STORAGE_URL}/${imageString.replace(/^\/+/, '')}`;
}

/*
|--------------------------------------------------------------------------
| Extract Images
|--------------------------------------------------------------------------
|
| Handles:
| - product.images[]
| - product.image_urls[]
| - product.gallery[]
| - product.photos[]
| - product.media[]
| - image_url
| - image
| - thumbnail
| - JSON strings containing arrays
|
|--------------------------------------------------------------------------
*/

function extractProductImages(product) {
  if (!product) return [];

  const collected = [];

  const addImage = (value) => {
    if (!value) return;

    /*
    | JSON string such as:
    | ["products/a.jpg","products/b.jpg"]
    */
    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (
        (trimmed.startsWith('[') &&
          trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') &&
          trimmed.endsWith('}'))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          addImage(parsed);
          return;
        } catch {
          // Treat it as a normal image path.
        }
      }

      const imageUrl = getImageUrl(trimmed);

      if (imageUrl) {
        collected.push(imageUrl);
      }

      return;
    }

    /*
    | Array of images
    */
    if (Array.isArray(value)) {
      value.forEach((item) => {
        addImage(item);
      });

      return;
    }

    /*
    | Image object
    */
    if (typeof value === 'object') {
      const possibleImage =
        value.image_url ||
        value.url ||
        value.path ||
        value.image ||
        value.src;

      if (possibleImage) {
        addImage(possibleImage);
      }
    }
  };

  /*
  | Main image collections
  */
  addImage(product.images);
  addImage(product.image_urls);
  addImage(product.gallery);
  addImage(product.photos);
  addImage(product.media);
  addImage(product.product_images);

  /*
  | Single-image fallback fields
  */
  addImage(product.image_url);
  addImage(product.image);
  addImage(product.thumbnail);

  /*
  | Remove duplicate images
  */
  return [...new Set(collected)];
}

/*
|--------------------------------------------------------------------------
| Format NPR
|--------------------------------------------------------------------------
*/

function formatNPR(value) {
  const number = Number(value);

  return `NPR ${(Number.isFinite(number) ? number : 0).toLocaleString(
    'en-NP'
  )}`;
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-NP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/*
|--------------------------------------------------------------------------
| Auction Detail
|--------------------------------------------------------------------------
*/

export default function AuctionDetail() {
  const { id } = useParams();

  const { user } = useContext(AuthContext);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');

  const [activeImage, setActiveImage] = useState(null);

  const [now, setNow] = useState(Date.now());

  /*
  |--------------------------------------------------------------------------
  | Load Auction
  |--------------------------------------------------------------------------
  */

  async function loadAuction() {
    try {
      setLoading(true);
      setError('');

      const response = await getAuctionById(id);

      const data =
        response?.data?.data ||
        response?.data;

      setAuction(data || null);
    } catch (err) {
      console.error(
        'Failed to load auction:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to load this auction.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAuction();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Keep Time Updated
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Product
  |--------------------------------------------------------------------------
  */

  const product = auction?.product || {};

  /*
  |--------------------------------------------------------------------------
  | All Product Images
  |--------------------------------------------------------------------------
  */

  const images = useMemo(() => {
    return extractProductImages(product);
  }, [product]);

  /*
  |--------------------------------------------------------------------------
  | Set First Image
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (images.length === 0) {
      setActiveImage(null);
      return;
    }

    /*
    | Keep currently selected image if it still exists.
    */
    if (
      activeImage &&
      images.includes(activeImage)
    ) {
      return;
    }

    setActiveImage(images[0]);
  }, [images, activeImage]);

  /*
  |--------------------------------------------------------------------------
  | Auction Phase
  |--------------------------------------------------------------------------
  */

  const phase = useMemo(
    () =>
      getAuctionPhase(
        auction,
        now
      ),
    [auction, now]
  );

  const isActive = phase === 'active';
  const isEnded = phase === 'closed';
  const isUpcoming = phase === 'pending';

  /*
  |--------------------------------------------------------------------------
  | Product Information
  |--------------------------------------------------------------------------
  */

  const title =
    product?.title ||
    product?.name ||
    'Auction Item';

  const category =
    product?.category ||
    '';

  const city =
    product?.city ||
    product?.location ||
    '';

  const description =
    product?.description ||
    'No description available for this item.';

  /*
  |--------------------------------------------------------------------------
  | Start / End Time
  |--------------------------------------------------------------------------
  */

  const auctionStartTime =
    auction?.start_time ??
    auction?.startTime ??
    auction?.starts_at ??
    auction?.startsAt ??
    null;

  const auctionEndTime =
    auction?.end_time ??
    auction?.endTime ??
    auction?.ends_at ??
    auction?.endsAt ??
    null;

  /*
  |--------------------------------------------------------------------------
  | Starting Price
  |--------------------------------------------------------------------------
  */

  const startingPrice = Number(
    auction?.starting_price ??
      auction?.startingPrice ??
      product?.starting_price ??
      product?.startingPrice ??
      0
  );

  /*
  |--------------------------------------------------------------------------
  | Bid History
  |--------------------------------------------------------------------------
  */

  const bids = useMemo(() => {
    if (Array.isArray(auction?.bids)) {
      return auction.bids;
    }

    if (Array.isArray(auction?.bid_history)) {
      return auction.bid_history;
    }

    return [];
  }, [auction]);

  /*
  |--------------------------------------------------------------------------
  | Highest Bid From History
  |--------------------------------------------------------------------------
  */

  const highestBidFromHistory =
    bids.length > 0
      ? Math.max(
          ...bids.map((bid) =>
            Number(
              bid?.amount ??
                bid?.bid_amount ??
                0
            )
          )
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | API Current Bid
  |--------------------------------------------------------------------------
  */

  const apiCurrentBid = Number(
    auction?.current_bid ??
      auction?.currentBid ??
      0
  );

  /*
  |--------------------------------------------------------------------------
  | Current Bid
  |--------------------------------------------------------------------------
  */

  const currentBid =
    highestBidFromHistory > 0
      ? highestBidFromHistory
      : apiCurrentBid > 0
      ? apiCurrentBid
      : startingPrice;

  /*
  |--------------------------------------------------------------------------
  | Has Existing Bid
  |--------------------------------------------------------------------------
  */

  const hasExistingBid =
    highestBidFromHistory > 0 ||
    apiCurrentBid > 0;

  /*
  |--------------------------------------------------------------------------
  | Bid Increment
  |--------------------------------------------------------------------------
  */

  const bidIncrement = Number(
    auction?.bid_increment ??
      auction?.minimum_increment ??
      100
  );

  /*
  |--------------------------------------------------------------------------
  | Minimum Bid
  |--------------------------------------------------------------------------
  */

  const minimumBid =
    hasExistingBid
      ? currentBid + bidIncrement
      : startingPrice;

  /*
  |--------------------------------------------------------------------------
  | Place Bid
  |--------------------------------------------------------------------------
  */

  async function handlePlaceBid(event) {
    event.preventDefault();

    if (!user) {
      setBidError(
        'Please login before placing a bid.'
      );
      return;
    }

    if (!isActive) {
      setBidError(
        'This auction is no longer accepting bids.'
      );
      return;
    }

    const amount = Number(bidAmount);

    if (
      !Number.isFinite(amount) ||
      amount < minimumBid
    ) {
      setBidError(
        `Your bid must be at least ${formatNPR(
          minimumBid
        )}.`
      );
      return;
    }

    try {
      setBidLoading(true);
      setBidError('');

      await placeBid(id, {
        auction_id: id,
        amount,
      });

      setBidAmount('');

      await loadAuction();
    } catch (err) {
      console.error(
        'Failed to place bid:',
        err
      );

      setBidError(
        err?.response?.data?.message ||
          'Failed to place your bid.'
      );
    } finally {
      setBidLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10 text-gray-800">
        <div className="mx-auto max-w-7xl">

          <Breadcrumbs
            items={[
              {
                label: 'Auction',
              },
            ]}
          />

          <div className="flex min-h-[50vh] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-600" />

              <p className="text-gray-500">
                Loading auction...
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10 text-gray-800">

        <div className="mx-auto max-w-3xl">

          <Breadcrumbs
            items={[
              {
                label: 'Auction',
              },
            ]}
          />

          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <div className="mb-4 text-5xl">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Auction Not Found
            </h1>

            <p className="mt-3 text-gray-500">
              {error ||
                'This auction could not be found.'}
            </p>

            <Link
              to="/listings"
              className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-500"
            >
              Browse Auctions
            </Link>

          </div>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-gray-900 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* BREADCRUMBS */}

        <Breadcrumbs
          items={[
            {
              label: 'Browse Auctions',
              to: '/listings',
            },

            ...(category
              ? [
                  {
                    label: category,
                    to: `/listings?category=${encodeURIComponent(
                      category
                    )}`,
                  },
                ]
              : []),

            ...(city
              ? [
                  {
                    label: city,
                    to: `/listings?city=${encodeURIComponent(
                      city
                    )}`,
                  },
                ]
              : []),

            {
              label: title,
            },
          ]}
        />

        {/* STATUS */}

        <div className="mb-6 flex flex-wrap items-center gap-3">

          {isActive && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-gray-900 shadow-sm ring-1 ring-gray-200">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              LIVE AUCTION
            </span>
          )}

          {isUpcoming && (
            <span className="rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-bold text-yellow-800 ring-1 ring-yellow-200">
              UPCOMING
            </span>
          )}

          {isEnded && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              AUCTION ENDED
            </span>
          )}

          {category && (
            <span className="rounded-full bg-white px-4 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200">
              {category}
            </span>
          )}

          {city && (
            <span className="rounded-full bg-white px-4 py-1.5 text-sm text-gray-600 ring-1 ring-gray-200">
              📍 {city}
            </span>
          )}

        </div>

        {/* MAIN GRID */}

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

          {/* LEFT */}

          <section>

            {/* IMAGE GALLERY */}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              {/* MAIN IMAGE */}

              <div className="flex h-[420px] items-center justify-center bg-gray-50">

                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-7xl">
                    📦
                  </div>
                )}

              </div>

              {images.length > 0 && (
                <div className="border-t border-gray-200 p-4">

                  <div className="flex gap-3 overflow-x-auto pb-1">

                    {images.map(
                      (image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() =>
                            setActiveImage(image)
                          }
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 transition ${
                            activeImage === image
                              ? 'border-emerald-500 ring-2 ring-emerald-100'
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${title} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* DESCRIPTION */}

            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-900">
                Description
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {description}
              </p>

            </div>

            {/* PRODUCT INFORMATION */}

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-900">
                Item Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <InfoRow
                  label="Category"
                  value={category || '—'}
                />

                <InfoRow
                  label="Location"
                  value={city || '—'}
                />

                <InfoRow
                  label="Condition"
                  value={
                    product?.condition || '—'
                  }
                />

                <InfoRow
                  label="Brand"
                  value={
                    product?.brand || '—'
                  }
                />

                <InfoRow
                  label="Start Time"
                  value={formatDate(
                    auctionStartTime
                  )}
                />

                <InfoRow
                  label="End Time"
                  value={formatDate(
                    auctionEndTime
                  )}
                />

              </div>

            </div>

          </section>

          {/* RIGHT */}

          <aside>

            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              {/* TITLE */}

              <h1 className="text-2xl font-bold leading-tight text-gray-900">
                {title}
              </h1>

              {/* PRICE */}

              <div className="mt-7 rounded-xl border border-gray-200 bg-slate-50 p-5">

                <p className="text-sm text-gray-500">
                  {isEnded
                    ? 'Final Bid'
                    : hasExistingBid
                    ? 'Current Bid'
                    : 'Starting Bid'}
                </p>

                <p className="mt-1 text-3xl font-bold text-emerald-600">
                  {formatNPR(currentBid)}
                </p>

                {!isEnded && (
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum next bid:{' '}
                    <span className="font-semibold text-gray-800">
                      {formatNPR(minimumBid)}
                    </span>
                  </p>
                )}

              </div>

              {/* COUNTDOWN */}

              {isActive &&
                auctionEndTime && (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">

                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Auction Ends In
                    </p>

                    <CountdownTimer
                      endTime={auctionEndTime}
                    />

                  </div>
                )}

              {/* UPCOMING */}

              {isUpcoming && (
                <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                  <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
                    Starts
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {formatDate(
                      auctionStartTime
                    )}
                  </p>

                </div>
              )}

              {/* ENDED */}

              {isEnded && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">

                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Ended
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {formatDate(
                      auctionEndTime
                    )}
                  </p>

                </div>
              )}

              {/* BID FORM */}

              {isActive && (
                <form
                  onSubmit={handlePlaceBid}
                  className="mt-6"
                >

                  <label
                    htmlFor="bidAmount"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Your Bid
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                      NPR
                    </span>

                    <input
                      id="bidAmount"
                      type="number"
                      min={minimumBid}
                      step="1"
                      value={bidAmount}
                      onChange={(event) =>
                        setBidAmount(
                          event.target.value
                        )
                      }
                      placeholder={String(
                        minimumBid
                      )}
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-14 pr-4 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />

                  </div>

                  {bidError && (
                    <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {bidError}
                    </p>
                  )}

                  {!user ? (
                    <Link
                      to="/login"
                      className="mt-4 block w-full rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-500"
                    >
                      Login to Bid
                    </Link>
                  ) : (
                    <button
                      type="submit"
                      disabled={bidLoading}
                      className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {bidLoading
                        ? 'Placing Bid...'
                        : 'Place Bid'}
                    </button>
                  )}

                </form>
              )}

              {/* SECURITY / ESCROW */}

              <div className="mt-6 rounded-xl border border-gray-200 bg-slate-50 p-4">

                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-lg">
                    🔒
                  </div>

                  <div>

                    <p className="font-semibold text-gray-900">
                      Secure Auction
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      NILAAM protects the
                      transaction through its
                      secure payment and
                      escrow workflow.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

        {/* BID HISTORY */}

        <section className="mt-10">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-gray-900">
              {isActive
                ? 'Live Bid History'
                : 'Bid History'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {bids.length} bid
              {bids.length !== 1
                ? 's'
                : ''}{' '}
              recorded
            </p>

          </div>

          {bids.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              No bids have been placed yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="divide-y divide-gray-100">

                {bids.map(
                  (bid, index) => {

                    const bidder =
                      bid?.user?.name ||
                      bid?.bidder?.name ||
                      bid?.user_name ||
                      'Anonymous Bidder';

                    const amount =
                      bid?.amount ??
                      bid?.bid_amount ??
                      0;

                    const createdAt =
                      bid?.created_at ||
                      bid?.createdAt;

                    return (
                      <div
                        key={
                          bid?.id ||
                          `${bidder}-${index}`
                        }
                        className="flex items-center justify-between gap-4 p-5 transition hover:bg-gray-50"
                      >

                        <div>

                          <p className="font-semibold text-gray-900">
                            {bidder}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(
                              createdAt
                            )}
                          </p>

                        </div>

                        <p className="font-bold text-emerald-600">
                          {formatNPR(
                            amount
                          )}
                        </p>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Information Row
|--------------------------------------------------------------------------
*/

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">

      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}
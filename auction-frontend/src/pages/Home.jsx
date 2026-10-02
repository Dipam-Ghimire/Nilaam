import { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import { getMyProducts } from "../api/products";
import CountdownTimer from "../components/auction/CountdownTimer";
import { AuthContext } from "../context/AuthContext";
import {
  getMyStats,
  getMarketplaceStats,
} from "../api/stats";

const STORAGE_URL = "http://127.0.0.1:8000/storage";

const categoryIcons = {
  Electronics: "▣",
  Furniture: "⌂",
  Vehicles: "▰",
  Collectibles: "◈",
  Cameras: "◎",
  Motorcycles: "♢",
  Laptops: "▣",
  Musical: "♫",
};

function getCategoryIcon(category) {
  return categoryIcons[category] || "◈";
}

function formatNPR(value) {
  const number = Number(value || 0);

  return `NPR ${number.toLocaleString("en-IN")}`;
}

/* =========================================================
   GET CURRENT AUCTION PRICE
========================================================= */

function getAuctionPrice(auction) {
  if (!auction) return 0;

  const possiblePrices = [
    auction.current_bid,
    auction.currentBid,
    auction.highest_bid,
    auction.highestBid,
    auction.current_price,
    auction.currentPrice,
    auction.highest_price,
    auction.highestPrice,
    auction.last_bid_amount,
    auction.lastBidAmount,
    auction.bid_amount,
    auction.bidAmount,
    auction.price,
    auction.product?.current_bid,
    auction.product?.currentBid,
    auction.product?.current_price,
    auction.product?.currentPrice,
  ];

  for (const price of possiblePrices) {
    if (
      price !== null &&
      price !== undefined &&
      price !== "" &&
      !Number.isNaN(Number(price))
    ) {
      return Number(price);
    }
  }

  return getStartingPrice(auction);
}

function getStartingPrice(auction) {
  if (!auction) return 0;

  const possiblePrices = [
    auction.starting_price,
    auction.startingPrice,
    auction.start_price,
    auction.startPrice,
    auction.product?.starting_price,
    auction.product?.startingPrice,
  ];

  for (const price of possiblePrices) {
    if (
      price !== null &&
      price !== undefined &&
      price !== "" &&
      !Number.isNaN(Number(price))
    ) {
      return Number(price);
    }
  }

  return 0;
}

/* =========================================================
   BID COUNT
========================================================= */

function getBidCount(auction) {
  if (!auction) return 0;

  if (
    auction.bid_count !== undefined &&
    auction.bid_count !== null
  ) {
    return Number(auction.bid_count);
  }

  if (
    auction.bidCount !== undefined &&
    auction.bidCount !== null
  ) {
    return Number(auction.bidCount);
  }

  if (
    auction.total_bids !== undefined &&
    auction.total_bids !== null
  ) {
    return Number(auction.total_bids);
  }

  if (
    auction.totalBids !== undefined &&
    auction.totalBids !== null
  ) {
    return Number(auction.totalBids);
  }

  if (Array.isArray(auction.bids)) {
    return auction.bids.length;
  }

  return 0;
}

/* =========================================================
   USER ID
========================================================= */

function getUserId(user) {
  return (
    user?.id ??
    user?.user_id ??
    user?.userId ??
    user?.data?.id ??
    null
  );
}

/* =========================================================
   IMAGE
========================================================= */

function getImage(item) {
  if (!item) return null;

  let image =
    item?.image ||
    item?.image_url ||
    item?.imageUrl ||
    item?.thumbnail ||
    item?.thumbnail_url ||
    item?.thumbnailUrl ||
    item?.images?.[0] ||
    item?.product?.image ||
    item?.product?.image_url ||
    item?.product?.images?.[0];

  if (!image) return null;

  if (typeof image === "object") {
    image =
      image?.url ||
      image?.image_url ||
      image?.image ||
      image?.path ||
      null;
  }

  if (!image) return null;

  if (String(image).startsWith("http")) {
    return image;
  }

  return `${STORAGE_URL}/${String(image).replace(
    /^\/+/,
    ""
  )}`;
}

/* =========================================================
   PRODUCT / AUCTION IDS
========================================================= */

function getProductId(product) {
  return (
    product?.id ??
    product?.product_id ??
    product?.productId ??
    product?.product?.id ??
    null
  );
}

function getAuctionProductId(auction) {
  return (
    auction?.product_id ??
    auction?.productId ??
    auction?.product?.id ??
    auction?.product?.product_id ??
    null
  );
}

/* =========================================================
   AUCTION STATUS
========================================================= */

function getAuctionStatus(auction) {
  if (!auction) {
    return "PENDING";
  }

  const status = String(
    auction?.status ??
      auction?.auction_status ??
      auction?.auctionStatus ??
      ""
  ).toLowerCase();

  const now = new Date();

  const startTime =
    auction?.start_time ??
    auction?.startTime ??
    auction?.starts_at ??
    auction?.startsAt ??
    auction?.start_date ??
    auction?.startDate;

  const endTime =
    auction?.end_time ??
    auction?.endTime ??
    auction?.ends_at ??
    auction?.endsAt ??
    auction?.end_date ??
    auction?.endDate;

  /* ENDED */

  if (
    status === "ended" ||
    status === "closed" ||
    status === "completed" ||
    status === "expired" ||
    status === "finished"
  ) {
    return "ENDED";
  }

  if (endTime && new Date(endTime) <= now) {
    return "ENDED";
  }

  /* ACTIVE */

  if (
    status === "active" ||
    status === "live" ||
    status === "ongoing" ||
    status === "running"
  ) {
    return "ACTIVE";
  }

  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now >= start && now < end) {
      return "ACTIVE";
    }

    if (now < start) {
      return "PENDING";
    }
  }

  if (endTime && new Date(endTime) > now) {
    return "ACTIVE";
  }

  return "PENDING";
}

function isAuctionLive(auction) {
  return getAuctionStatus(auction) === "ACTIVE";
}

/* =========================================================
   USER BID HELPERS
========================================================= */

function bidBelongsToUser(bid, user) {
  const userId = getUserId(user);

  if (!userId || !bid) return false;

  const bidUserId =
    bid?.user_id ??
    bid?.userId ??
    bid?.bidder_id ??
    bid?.bidderId ??
    bid?.user?.id ??
    bid?.bidder?.id;

  return String(bidUserId) === String(userId);
}

function userHasBidOnAuction(auction, user) {
  if (!Array.isArray(auction?.bids)) {
    return false;
  }

  return auction.bids.some((bid) =>
    bidBelongsToUser(bid, user)
  );
}

function userWonAuction(auction, user) {
  if (!auction || !user) return false;

  const userId = getUserId(user);

  const winnerId =
    auction?.winner_id ??
    auction?.winnerId ??
    auction?.winner?.id ??
    auction?.winning_bid?.user_id ??
    auction?.winningBid?.user_id;

  return (
    getAuctionStatus(auction) === "ENDED" &&
    winnerId &&
    userId &&
    String(winnerId) === String(userId)
  );
}

/* =========================================================
   AUCTION CARD
========================================================= */

function AuctionCard({ auction }) {
  const image = getImage(auction);
  const status = getAuctionStatus(auction);

  const title =
    auction?.title ||
    auction?.product?.title ||
    "Untitled Auction";

  const category =
    auction?.category ||
    auction?.product?.category ||
    "Other";

  const currentPrice = getAuctionPrice(auction);
  const startingPrice = getStartingPrice(auction);
  const bidCount = getBidCount(auction);

  const endTime =
    auction?.end_time ??
    auction?.endTime ??
    auction?.ends_at ??
    auction?.endsAt;

  return (
    <Link
      to={`/auctions/${auction?.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-slate-300">
            {getCategoryIcon(category)}
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-semibold text-slate-700">
            {category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {status === "ACTIVE" && (
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold">
              ACTIVE
            </span>
          )}

          {status === "PENDING" && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
              PENDING
            </span>
          )}

          {status === "ENDED" && (
            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
              ENDED
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-slate-900 truncate group-hover:text-emerald-800 transition">
          {title}
        </h3>

        <div className="mt-4">
          <p className="text-xs text-slate-500">
            {status === "PENDING"
              ? "Starting Price"
              : status === "ENDED"
              ? "Final Price"
              : "Current Bid"}
          </p>

          <p className="text-xl font-bold text-emerald-900 mt-1">
            {formatNPR(
              status === "PENDING"
                ? startingPrice
                : currentPrice
            )}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            {bidCount} {bidCount === 1 ? "Bid" : "Bids"}
          </span>

          {status === "ACTIVE" && endTime ? (
            <CountdownTimer endTime={endTime} />
          ) : status === "PENDING" ? (
            <span className="text-amber-600 font-medium">
              Not Started
            </span>
          ) : (
            <span className="text-red-500 font-medium">
              Auction Ended
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   PUBLIC HOME
========================================================= */

function PublicHome({ auctions = [] }) {
  const featuredAuctions = auctions.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-800">
      <section className="w-full max-w-[1500px] mx-auto px-6 lg:px-8 pt-10 pb-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 lg:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-emerald-700 mb-3">
              NILAAM AUCTION PLATFORM
            </p>

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Discover. Bid. Win.
            </h1>

            <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
              Discover verified products, participate in live
              auctions, and find great deals through a secure
              online bidding experience.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/listings"
                className="px-6 py-3 rounded-xl bg-emerald-900 text-white font-semibold hover:bg-emerald-800 transition"
              >
                Explore Auctions
              </Link>

              <Link
                to="/register"
                className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1500px] mx-auto px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Active Auctions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Explore products currently available for bidding.
            </p>
          </div>

          <Link
            to="/listings"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-900"
          >
            View All →
          </Link>
        </div>

        {featuredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredAuctions.map((auction) => (
              <AuctionCard
                key={auction?.id}
                auction={auction}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500">
              No auctions available right now.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   SELLER AUCTION CARD
========================================================= */

function SellerAuctionCard({ product, auction }) {
  const status = getAuctionStatus(auction);
  const image = getImage(product || auction);

  const title =
    product?.title ||
    auction?.title ||
    auction?.product?.title ||
    "Untitled Listing";

  const category =
    product?.category ||
    auction?.category ||
    auction?.product?.category ||
    "Other";

  const currentPrice = getAuctionPrice(auction);

  const startingPrice = Number(
    product?.starting_price ??
      product?.startingPrice ??
      auction?.starting_price ??
      auction?.startingPrice ??
      0
  );

  const bidCount = getBidCount(auction);

  const endTime =
    auction?.end_time ??
    auction?.endTime ??
    auction?.ends_at ??
    auction?.endsAt;

  return (
    <Link
      to={
        auction?.id
          ? `/auctions/${auction.id}`
          : `/dashboard`
      }
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition"
    >
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
            {getCategoryIcon(category)}
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-semibold text-slate-700">
            {category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {status === "ACTIVE" && (
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
              ACTIVE
            </span>
          )}

          {status === "PENDING" && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">
              PENDING
            </span>
          )}

          {status === "ENDED" && (
            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
              ENDED
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-slate-900 truncate">
          {title}
        </h3>

        <div className="mt-3">
          <p className="text-xs text-slate-500">
            {status === "PENDING"
              ? "Starting Price"
              : status === "ENDED"
              ? "Final Price"
              : "Current Bid"}
          </p>

          <p className="text-lg font-bold text-emerald-900 mt-1">
            {formatNPR(
              status === "PENDING"
                ? startingPrice
                : currentPrice
            )}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {bidCount} {bidCount === 1 ? "Bid" : "Bids"}
          </span>

          {status === "ACTIVE" && endTime ? (
            <CountdownTimer endTime={endTime} />
          ) : status === "PENDING" ? (
            <span className="text-amber-600 font-medium">
              Not Started
            </span>
          ) : (
            <span className="text-red-500 font-medium">
              Ended
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   SELLER STAT
========================================================= */

function SellerStat({
  title,
  value,
  description,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-2">
        {value}
      </p>

      {description && (
        <p className="text-xs text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   BUYER STAT
========================================================= */

function BuyerStat({
  title,
  value,
  description,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-2">
        {value}
      </p>

      {description && (
        <p className="text-xs text-slate-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD BOX
========================================================= */

function DashboardBox({
  title,
  description,
  link,
  buttonText,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {description}
      </p>

      {link && buttonText && (
        <Link
          to={link}
          className="inline-block mt-5 px-4 py-2 rounded-xl bg-emerald-900 text-white text-sm font-semibold hover:bg-emerald-800 transition"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   TRUST CARD
========================================================= */

function TrustCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 font-bold">
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900 mt-4">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MINI AUCTION
========================================================= */

function MiniAuction({ auction }) {
  const image = getImage(auction);

  const title =
    auction?.title ||
    auction?.product?.title ||
    "Untitled Auction";

  const status = getAuctionStatus(auction);

  return (
    <Link
      to={`/auctions/${auction?.id}`}
      className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-slate-300">
            ◈
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-slate-900 truncate">
          {title}
        </h4>

        <p className="text-sm text-emerald-900 font-bold mt-1">
          {formatNPR(getAuctionPrice(auction))}
        </p>

        <span
          className={`inline-block mt-2 text-xs font-semibold ${
            status === "ACTIVE"
              ? "text-emerald-600"
              : status === "PENDING"
              ? "text-amber-600"
              : "text-red-500"
          }`}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}

/* =========================================================
   SELLER HOME
========================================================= */

function SellerHome({
  user,
  auctions = [],
  products = [],
  stats = {},
}) {
  const sellerId = getUserId(user);

  const sellerProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products;
  }, [products]);

  const sellerAuctions = useMemo(() => {
    if (!Array.isArray(auctions)) return [];

    return auctions.filter((auction) => {
      const auctionSellerId =
        auction?.seller_id ??
        auction?.sellerId ??
        auction?.seller?.id ??
        auction?.product?.seller_id ??
        auction?.product?.seller?.id;

      return (
        !sellerId ||
        !auctionSellerId ||
        String(auctionSellerId) ===
          String(sellerId)
      );
    });
  }, [auctions, sellerId]);

  /* =======================================================
     MY LISTINGS ORDER

     ACTIVE → PENDING → ENDED
  ======================================================= */

  const sellerAuctionCards = useMemo(() => {
    const cards = sellerProducts.map((product) => {
      const productId = getProductId(product);

      const directAuction =
        product?.auction ||
        product?.active_auction ||
        product?.activeAuction ||
        null;

      const matchedAuction =
        directAuction ||
        sellerAuctions.find(
          (auction) =>
            String(getAuctionProductId(auction)) ===
            String(productId)
        );

      return {
        product,
        auction: matchedAuction,
      };
    });

    const statusOrder = {
      ACTIVE: 1,
      PENDING: 2,
      ENDED: 3,
    };

    return cards.sort((a, b) => {
      const statusA = getAuctionStatus(a.auction);
      const statusB = getAuctionStatus(b.auction);

      return (
        (statusOrder[statusA] || 4) -
        (statusOrder[statusB] || 4)
      );
    });
  }, [sellerProducts, sellerAuctions]);

  const activeAuctions = sellerAuctionCards.filter(
    ({ auction }) =>
      getAuctionStatus(auction) === "ACTIVE"
  );

  const totalListings =
    stats?.total_listings ??
    stats?.totalListings ??
    sellerProducts.length;

  const ongoingAuctions =
    stats?.ongoing_auctions ??
    stats?.ongoingAuctions ??
    activeAuctions.length;

  const activeLotsValue = activeAuctions.reduce(
    (total, item) =>
      total + getAuctionPrice(item.auction),
    0
  );

  const escrowLocked =
    stats?.escrow_locked ??
    stats?.escrowLocked ??
    stats?.locked_escrow ??
    stats?.lockedEscrow ??
    stats?.escrow_amount ??
    stats?.escrowAmount ??
    0;

  const disbursed =
    stats?.disbursed ??
    stats?.disbursed_amount ??
    stats?.disbursedAmount ??
    stats?.total_disbursed ??
    stats?.totalDisbursed ??
    stats?.total_earned ??
    stats?.totalEarned ??
    0;

  const userName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "User";

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-800">
      <main className="w-full max-w-[1500px] mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm text-emerald-700 font-semibold">
              SELLER DASHBOARD
            </p>

            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
              Namaste, {userName}
            </h1>

            <p className="text-slate-500 mt-2">
              Manage your listings and monitor your auctions.
            </p>
          </div>

          <Link
            to="/create-listing"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-900 text-white font-semibold hover:bg-emerald-800 transition"
          >
            + Create Listing
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SellerStat
            title="Active Lots Value"
            value={formatNPR(activeLotsValue)}
            description="Current active auction value"
          />

          <SellerStat
            title="Escrow Locked"
            value={formatNPR(escrowLocked)}
            description="Funds currently protected"
          />

          <SellerStat
            title="Disbursed"
            value={formatNPR(disbursed)}
            description="Amount released to you"
          />

          <SellerStat
            title="Total Listings"
            value={totalListings}
            description="Your submitted products"
          />

          <SellerStat
            title="Ongoing Auctions"
            value={ongoingAuctions}
            description="Currently active auctions"
          />
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Listings
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Track the current status of your auction listings.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="text-sm font-semibold text-emerald-800"
            >
              View Dashboard →
            </Link>
          </div>

          {sellerAuctionCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {sellerAuctionCards
                .slice(0, 8)
                .map(({ product, auction }) => (
                  <SellerAuctionCard
                    key={getProductId(product)}
                    product={product}
                    auction={auction}
                  />
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-500">
                You have not created any listings yet.
              </p>

              <Link
                to="/create-listing"
                className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-semibold"
              >
                Create Your First Listing
              </Link>
            </div>
          )}
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <DashboardBox
            title="Manage Listings"
            description="View, update and manage your products."
            link="/dashboard"
            buttonText="Open Dashboard"
          />

          <DashboardBox
            title="Create New Auction"
            description="List another product and start receiving bids."
            link="/create-listing"
            buttonText="Create Listing"
          />

          <DashboardBox
            title="Browse Marketplace"
            description="Explore other products currently available on Nilaam."
            link="/listings"
            buttonText="Browse Auctions"
          />
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   BUYER HOME
========================================================= */

function BuyerHome({
  user,
  auctions = [],
  stats = {},
}) {
  const userName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    "User";

  const myBids =
    stats?.my_bids ??
    stats?.myBids ??
    stats?.total_bids ??
    stats?.totalBids ??
    0;

  const wonAuctions =
    stats?.won_auctions ??
    stats?.wonAuctions ??
    stats?.auctions_won ??
    0;

  const activeBids =
    stats?.active_bids ??
    stats?.activeBids ??
    0;

  const featuredAuctions = auctions
    .filter(
      (auction) =>
        getAuctionStatus(auction) === "ACTIVE"
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-800">
      <main className="w-full max-w-[1500px] mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-sm text-emerald-700 font-semibold">
            BUYER DASHBOARD
          </p>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
            Namaste, {userName}
          </h1>

          <p className="text-slate-500 mt-2">
            Discover auctions and keep track of your bids.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BuyerStat
            title="My Bids"
            value={myBids}
            description="Total bids placed"
          />

          <BuyerStat
            title="Active Bids"
            value={activeBids}
            description="Bids in ongoing auctions"
          />

          <BuyerStat
            title="Won Auctions"
            value={wonAuctions}
            description="Auctions you have won"
          />
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Live Auctions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Find something worth bidding on.
              </p>
            </div>

            <Link
              to="/listings"
              className="text-sm font-semibold text-emerald-800"
            >
              View All →
            </Link>
          </div>

          {featuredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredAuctions.map((auction) => (
                <AuctionCard
                  key={auction?.id}
                  auction={auction}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-500">
                No live auctions available.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   BUYER + SELLER HOME
========================================================= */

function BuyerSellerHome({
  user,
  auctions = [],
  products = [],
  stats = {},
}) {
  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-800">
      <main className="w-full max-w-[1500px] mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-sm text-emerald-700 font-semibold">
            NILAAM MARKETPLACE
          </p>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">
            Namaste,{" "}
            {user?.name ||
              user?.full_name ||
              user?.fullName ||
              user?.username ||
              "User"}
          </h1>

          <p className="text-slate-500 mt-2">
            Buy, sell and participate in online auctions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DashboardBox
            title="Buy Products"
            description="Explore products and participate in live auctions."
            link="/listings"
            buttonText="Browse Auctions"
          />

          <DashboardBox
            title="Sell Products"
            description="Create a listing and offer your product for auction."
            link="/create-listing"
            buttonText="Create Listing"
          />
        </div>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Live Auctions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current products available for bidding.
              </p>
            </div>

            <Link
              to="/listings"
              className="text-sm font-semibold text-emerald-800"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {auctions
              .filter(
                (auction) =>
                  getAuctionStatus(auction) === "ACTIVE"
              )
              .slice(0, 8)
              .map((auction) => (
                <AuctionCard
                  key={auction?.id}
                  auction={auction}
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home() {
  const { user } = useContext(AuthContext);

  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});

  const role = String(
    user?.role ||
      user?.user_role ||
      user?.userRole ||
      ""
  ).toLowerCase();

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      try {
        const auctionResult = await getAuctions();

        if (mounted) {
          setAuctions(
            Array.isArray(auctionResult)
              ? auctionResult
              : auctionResult?.data || []
          );
        }

        if (user) {
          try {
            const productResult =
              await getMyProducts();

            if (mounted) {
              setProducts(
                Array.isArray(productResult)
                  ? productResult
                  : productResult?.data || []
              );
            }
          } catch (error) {
            console.error(
              "Failed to load seller products:",
              error
            );
          }

          try {
            const statsResult = await getMyStats();

            if (mounted) {
              setStats(
                statsResult?.data ||
                  statsResult ||
                  {}
              );
            }
          } catch (error) {
            console.error(
              "Failed to load user stats:",
              error
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load home data:",
          error
        );

        if (mounted) {
          setAuctions([]);
        }
      }
    }

    loadHomeData();

    /*
     * Refresh auction information every 10 seconds.
     *
     * This allows the Home page to pick up a new bid
     * from the backend without showing a loading screen.
     */
    const refreshInterval = setInterval(
      async () => {
        try {
          const auctionResult =
            await getAuctions();

          if (mounted) {
            setAuctions(
              Array.isArray(auctionResult)
                ? auctionResult
                : auctionResult?.data || []
            );
          }
        } catch (error) {
          console.error(
            "Failed to refresh auctions:",
            error
          );
        }
      },
      10000
    );

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [user]);

  /*
   * No loading screen.
   * The page renders immediately and data is loaded
   * in the background.
   */

  if (!user) {
    return <PublicHome auctions={auctions} />;
  }

  if (
    role === "seller" ||
    role === "vendor"
  ) {
    return (
      <SellerHome
        user={user}
        auctions={auctions}
        products={products}
        stats={stats}
      />
    );
  }

  if (
    role === "buyer_seller" ||
    role === "buyer-seller" ||
    role === "both" ||
    role === "buyer/seller"
  ) {
    return (
      <BuyerSellerHome
        user={user}
        auctions={auctions}
        products={products}
        stats={stats}
      />
    );
  }

  return (
    <BuyerHome
      user={user}
      auctions={auctions}
      stats={stats}
    />
  );
}

export default Home;
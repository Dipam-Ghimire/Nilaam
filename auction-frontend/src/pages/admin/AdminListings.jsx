import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';

import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from '../../api/admin';

const STORAGE_URL = 'http://127.0.0.1:8000/storage';

/* =========================================================
   HELPERS
========================================================= */

function Icon({ children, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {children}
    </span>
  );
}

function getImageUrl(product) {
  const image =
    product?.image_url ||
    product?.image ||
    product?.images?.[0]?.image_path ||
    product?.images?.[0]?.url ||
    '';

  if (!image) return '';

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image;
  }

  return `${STORAGE_URL}/${String(image).replace(/^\/+/, '')}`;
}

function formatNPR(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'NPR 0';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return `NPR ${value}`;
  }

  return `NPR ${number.toLocaleString('en-IN')}`;
}

function getCategoryIcon(category) {
  const value = String(category || '').toLowerCase();

  if (value.includes('electronic')) return 'devices';
  if (value.includes('furniture')) return 'chair';
  if (
    value.includes('vehicle') ||
    value.includes('car') ||
    value.includes('bike')
  ) {
    return 'directions_car';
  }

  if (value.includes('collectible')) return 'category';

  return 'inventory_2';
}

function getSeller(product) {
  return product?.seller || product?.user || {};
}

function getSellerName(product) {
  const seller = getSeller(product);

  return (
    seller?.name ||
    product?.seller_name ||
    product?.sellerName ||
    'Unknown Seller'
  );
}

function getKycStatus(product) {
  const seller = getSeller(product);

  const status =
    seller?.kyc_status ||
    seller?.kycStatus ||
    product?.kyc_status ||
    product?.kycStatus ||
    '';

  return String(status).toLowerCase();
}

function getKycLabel(product) {
  const status = getKycStatus(product);

  if (
    status === 'verified' ||
    status === 'approved'
  ) {
    return 'Verified';
  }

  if (
    status === 'pending' ||
    status === 'submitted' ||
    status === 'under_review'
  ) {
    return 'Pending';
  }

  if (
    status === 'rejected' ||
    status === 'failed'
  ) {
    return 'Rejected';
  }

  return 'Not Verified';
}

function getSubmittedTime(product) {
  const value =
    product?.created_at ||
    product?.createdAt ||
    product?.submitted_at ||
    product?.submittedAt;

  if (!value) return 'Recently';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getCondition(product) {
  return (
    product?.condition ||
    product?.item_condition ||
    'Not specified'
  );
}

/* =========================================================
   ADMIN LISTINGS
========================================================= */

function AdminListings() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('all');

  const [priceFilter, setPriceFilter] =
    useState('all');

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [processingId, setProcessingId] =
    useState(null);

  const [batchProcessing, setBatchProcessing] =
    useState(false);

  const [rejectModal, setRejectModal] =
    useState({
      open: false,
      product: null,
      bulk: false,
    });

  const [inspectModal, setInspectModal] =
    useState({
      open: false,
      product: null,
    });

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  async function loadPending() {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await getPendingProducts();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      setProducts(data);
      setSelectedIds([]);
    } catch (error) {
      console.error(
        'Failed to load pending listings:',
        error
      );

      setProducts([]);

      setErrorMessage(
        error?.response?.data?.message ||
          'Unable to load listings from the database.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const values = products
      .map(
        (product) =>
          product?.category ||
          product?.category_name ||
          ''
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [products]);

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const category =
        product?.category ||
        product?.category_name ||
        '';

      const matchesCategory =
        categoryFilter === 'all' ||
        String(category).toLowerCase() ===
          String(categoryFilter).toLowerCase();

      const price = Number(
        product?.starting_price ||
          product?.startingPrice ||
          0
      );

      let matchesPrice = true;

      if (priceFilter === 'under25k') {
        matchesPrice = price < 25000;
      }

      if (priceFilter === '25k100k') {
        matchesPrice =
          price >= 25000 &&
          price <= 100000;
      }

      if (priceFilter === 'over100k') {
        matchesPrice = price > 100000;
      }

      return matchesCategory && matchesPrice;
    });
  }, [
    products,
    categoryFilter,
    priceFilter,
  ]);

  /* =======================================================
     SELECTION
  ======================================================= */

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) =>
      selectedIds.includes(product.id)
    );

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !filteredProducts.some(
              (product) => product.id === id
            )
        )
      );

      return;
    }

    const visibleIds = filteredProducts.map(
      (product) => product.id
    );

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...visibleIds,
      ]),
    ]);
  }

  function toggleSelected(id) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (selectedId) => selectedId !== id
        );
      }

      return [...current, id];
    });
  }

  /* =======================================================
     APPROVE SINGLE
  ======================================================= */

  async function handleApprove(id) {
    try {
      setProcessingId(id);

      await approveProduct(id);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== id
        )
      );

      setSelectedIds((current) =>
        current.filter(
          (selectedId) => selectedId !== id
        )
      );

      setInspectModal({
        open: false,
        product: null,
      });
    } catch (error) {
      console.error(
        'Failed to approve listing:',
        error
      );

      alert(
        error?.response?.data?.message ||
          'Failed to approve listing.'
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =======================================================
     REJECT SINGLE
  ======================================================= */

  async function handleReject(id) {
    try {
      setProcessingId(id);

      await rejectProduct(id);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== id
        )
      );

      setSelectedIds((current) =>
        current.filter(
          (selectedId) => selectedId !== id
        )
      );

      setRejectModal({
        open: false,
        product: null,
        bulk: false,
      });

      setInspectModal({
        open: false,
        product: null,
      });
    } catch (error) {
      console.error(
        'Failed to reject listing:',
        error
      );

      alert(
        error?.response?.data?.message ||
          'Failed to reject listing.'
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =======================================================
     APPROVE SELECTED
  ======================================================= */

  async function handleApproveSelected() {
    if (selectedIds.length === 0) return;

    try {
      setBatchProcessing(true);

      const ids = [...selectedIds];

      for (const id of ids) {
        await approveProduct(id);
      }

      setProducts((current) =>
        current.filter(
          (product) =>
            !ids.includes(product.id)
        )
      );

      setSelectedIds([]);
    } catch (error) {
      console.error(
        'Failed to approve selected listings:',
        error
      );

      alert(
        error?.response?.data?.message ||
          'Some listings could not be approved.'
      );
    } finally {
      setBatchProcessing(false);
    }
  }

  /* =======================================================
     REJECT SELECTED
  ======================================================= */

  async function handleRejectSelected() {
    if (selectedIds.length === 0) return;

    try {
      setBatchProcessing(true);

      const ids = [...selectedIds];

      for (const id of ids) {
        await rejectProduct(id);
      }

      setProducts((current) =>
        current.filter(
          (product) =>
            !ids.includes(product.id)
        )
      );

      setSelectedIds([]);

      setRejectModal({
        open: false,
        product: null,
        bulk: false,
      });
    } catch (error) {
      console.error(
        'Failed to reject selected listings:',
        error
      );

      alert(
        error?.response?.data?.message ||
          'Some listings could not be rejected.'
      );
    } finally {
      setBatchProcessing(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8ff]">

        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">

          <div className="flex flex-col lg:flex-row gap-5">

            <aside className="w-full lg:w-[250px] shrink-0">
              <AdminSidebar />
            </aside>

            <main className="flex-1 min-w-0 animate-pulse">

              <div className="h-10 bg-slate-200 rounded w-80 mb-8" />

              <div className="h-20 bg-white rounded-2xl border border-slate-200 mb-5" />

              <div className="bg-white rounded-2xl border border-slate-200 h-[550px]" />

            </main>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Plus_Jakarta_Sans'] text-slate-900">

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">

        <div className="flex flex-col lg:flex-row gap-5">

          {/* =================================================
              EXISTING ADMIN SIDEBAR
          ================================================= */}

          <aside className="w-full lg:w-[250px] shrink-0">
            <AdminSidebar />
          </aside>

          {/* =================================================
              LISTINGS CONTENT
          ================================================= */}

          <main className="flex-1 min-w-0">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-7">

              <div>

                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">
                  Marketplace Management
                </p>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                  Product Listings
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                  Review seller submissions and approve or reject listings.
                </p>

              </div>

              <button
                type="button"
                onClick={loadPending}
                disabled={loading}
                className="self-start bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:shadow-sm transition disabled:opacity-60"
              >
                <span className="flex items-center gap-2">

                  <Icon
                    className={
                      loading
                        ? 'animate-spin'
                        : ''
                    }
                  >
                    refresh
                  </Icon>

                  Refresh Listings

                </span>
              </button>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="font-semibold text-red-800">
                      Unable to load listings
                    </p>

                    <p className="text-sm text-red-600 mt-1">
                      {errorMessage}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={loadPending}
                    className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Retry
                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                LISTING SUMMARY
            ================================================= */}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-b-4 border-b-emerald-100">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Pending Listings
                    </p>

                    <p className="text-2xl md:text-3xl font-bold font-mono mt-2">
                      {products.length}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-800">
                    <Icon>
                      inventory_2
                    </Icon>
                  </div>

                </div>

              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-b-4 border-b-amber-200">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Showing
                    </p>

                    <p className="text-2xl md:text-3xl font-bold font-mono mt-2">
                      {filteredProducts.length}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-700">
                    <Icon>
                      filter_alt
                    </Icon>
                  </div>

                </div>

              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm border-b-4 border-b-red-200 col-span-2 lg:col-span-1">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Selected
                    </p>

                    <p className="text-2xl md:text-3xl font-bold font-mono mt-2">
                      {selectedIds.length}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-700">
                    <Icon>
                      checklist
                    </Icon>
                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                FILTERS + ACTIONS
            ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm">

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                <div className="flex flex-col sm:flex-row gap-3">

                  {/* CATEGORY */}

                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target.value
                      )
                    }
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-emerald-700"
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>

                  {/* PRICE */}

                  <select
                    value={priceFilter}
                    onChange={(event) =>
                      setPriceFilter(
                        event.target.value
                      )
                    }
                    className="border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-emerald-700"
                  >
                    <option value="all">
                      All Prices
                    </option>

                    <option value="under25k">
                      Under NPR 25,000
                    </option>

                    <option value="25k100k">
                      NPR 25,000 - 100,000
                    </option>

                    <option value="over100k">
                      Above NPR 100,000
                    </option>
                  </select>

                </div>

                {/* BULK ACTIONS */}

                <div className="flex flex-col sm:flex-row gap-2">

                  <button
                    type="button"
                    onClick={
                      handleApproveSelected
                    }
                    disabled={
                      selectedIds.length === 0 ||
                      batchProcessing
                    }
                    className="bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon className="text-[18px]">
                        check_circle
                      </Icon>

                      Approve Selected
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRejectModal({
                        open: true,
                        product: null,
                        bulk: true,
                      })
                    }
                    disabled={
                      selectedIds.length === 0 ||
                      batchProcessing
                    }
                    className="bg-red-700 hover:bg-red-800 text-white rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon className="text-[18px]">
                        cancel
                      </Icon>

                      Reject Selected
                    </span>
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                LISTINGS TABLE
            ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-4 text-left">

                        <input
                          type="checkbox"
                          checked={
                            allVisibleSelected
                          }
                          onChange={
                            toggleSelectAll
                          }
                          className="w-4 h-4 accent-emerald-800"
                        />

                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Product
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Category
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Seller
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Condition
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Starting Price
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        KYC
                      </th>

                      <th className="px-4 py-4 text-left text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Submitted
                      </th>

                      <th className="px-4 py-4 text-right text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredProducts.length === 0 ? (

                      <tr>

                        <td
                          colSpan="9"
                          className="px-6 py-16 text-center"
                        >

                          <div className="flex flex-col items-center">

                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">

                              <Icon className="text-2xl">
                                inventory_2
                              </Icon>

                            </div>

                            <p className="font-semibold text-slate-700">
                              {products.length === 0
                                ? 'No pending listings'
                                : 'No listings match the selected filters'}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {products.length === 0
                                ? 'New seller submissions will appear here.'
                                : 'Try changing the category or price filter.'}
                            </p>

                          </div>

                        </td>

                      </tr>

                    ) : (

                      filteredProducts.map(
                        (product) => {

                          const image =
                            getImageUrl(
                              product
                            );

                          const category =
                            product?.category ||
                            product?.category_name ||
                            'Uncategorized';

                          const sellerName =
                            getSellerName(
                              product
                            );

                          const kycLabel =
                            getKycLabel(
                              product
                            );

                          const startingPrice =
                            product?.starting_price ??
                            product?.startingPrice ??
                            0;

                          return (
                            <tr
                              key={
                                product.id
                              }
                              className="border-b border-slate-100 hover:bg-slate-50 transition"
                            >

                              {/* SELECT */}

                              <td className="px-5 py-4">

                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(
                                    product.id
                                  )}
                                  onChange={() =>
                                    toggleSelected(
                                      product.id
                                    )
                                  }
                                  className="w-4 h-4 accent-emerald-800"
                                />

                              </td>

                              {/* PRODUCT */}

                              <td className="px-4 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">

                                    {image ? (
                                      <img
                                        src={image}
                                        alt={
                                          product?.title ||
                                          'Product'
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Icon>
                                          {getCategoryIcon(
                                            category
                                          )}
                                        </Icon>
                                      </div>
                                    )}

                                  </div>

                                  <div className="min-w-0">

                                    <p className="font-semibold text-sm text-slate-900 truncate max-w-[230px]">
                                      {product?.title ||
                                        'Untitled Product'}
                                    </p>

                                    <p className="text-[10px] text-slate-400 mt-1">
                                      ID #
                                      {product?.id ||
                                        'N/A'}
                                    </p>

                                  </div>

                                </div>

                              </td>

                              {/* CATEGORY */}

                              <td className="px-4 py-4">

                                <div className="flex items-center gap-2">

                                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">

                                    <Icon className="text-[18px]">
                                      {getCategoryIcon(
                                        category
                                      )}
                                    </Icon>

                                  </span>

                                  <span className="text-xs font-medium text-slate-700">
                                    {category}
                                  </span>

                                </div>

                              </td>

                              {/* SELLER */}

                              <td className="px-4 py-4">

                                <div>

                                  <p className="text-xs font-semibold text-slate-800">
                                    {sellerName}
                                  </p>

                                  <span
                                    className={`inline-flex mt-1 px-2 py-1 rounded-full text-[9px] font-bold ${
                                      kycLabel ===
                                      'Verified'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : kycLabel ===
                                            'Rejected'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {kycLabel}
                                  </span>

                                </div>

                              </td>

                              {/* CONDITION */}

                              <td className="px-4 py-4">

                                <span className="text-xs text-slate-700">
                                  {getCondition(
                                    product
                                  )}
                                </span>

                              </td>

                              {/* PRICE */}

                              <td className="px-4 py-4">

                                <span className="text-xs font-bold font-mono text-emerald-800">
                                  {formatNPR(
                                    startingPrice
                                  )}
                                </span>

                              </td>

                              {/* KYC */}

                              <td className="px-4 py-4">

                                <span
                                  className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full ${
                                    kycLabel ===
                                    'Verified'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : kycLabel ===
                                          'Rejected'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-amber-50 text-amber-700'
                                  }`}
                                >

                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      kycLabel ===
                                      'Verified'
                                        ? 'bg-emerald-500'
                                        : kycLabel ===
                                            'Rejected'
                                          ? 'bg-red-500'
                                          : 'bg-amber-500'
                                    }`}
                                  />

                                  {kycLabel}

                                </span>

                              </td>

                              {/* SUBMITTED */}

                              <td className="px-4 py-4">

                                <span className="text-xs text-slate-500">
                                  {getSubmittedTime(
                                    product
                                  )}
                                </span>

                              </td>

                              {/* ACTIONS */}

                              <td className="px-4 py-4">

                                <div className="flex items-center justify-end gap-2">

                                  {/* INSPECT */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setInspectModal({
                                        open: true,
                                        product,
                                      })
                                    }
                                    className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
                                    title="View listing"
                                  >
                                    <Icon className="text-[18px]">
                                      visibility
                                    </Icon>
                                  </button>

                                  {/* APPROVE */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApprove(
                                        product.id
                                      )
                                    }
                                    disabled={
                                      processingId ===
                                      product.id
                                    }
                                    className="h-9 px-3 rounded-lg bg-emerald-900 text-white flex items-center justify-center gap-1.5 hover:bg-emerald-950 transition disabled:opacity-50 text-xs font-semibold"
                                    title="Approve listing"
                                  >
                                    <Icon className="text-[17px]">
                                      check
                                    </Icon>

                                    Approve
                                  </button>

                                  {/* REJECT */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRejectModal({
                                        open: true,
                                        product,
                                        bulk: false,
                                      })
                                    }
                                    disabled={
                                      processingId ===
                                      product.id
                                    }
                                    className="h-9 px-3 rounded-lg bg-red-50 text-red-700 flex items-center justify-center gap-1.5 hover:bg-red-100 transition disabled:opacity-50 text-xs font-semibold"
                                    title="Reject listing"
                                  >
                                    <Icon className="text-[17px]">
                                      close
                                    </Icon>

                                    Reject
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

              {/* TABLE FOOTER */}

              <div className="border-t border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {filteredProducts.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {products.length}
                  </span>{' '}
                  pending listings
                </p>

                {selectedIds.length > 0 && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {selectedIds.length}
                    </span>{' '}
                    selected
                  </p>
                )}

              </div>

            </div>

          </main>

        </div>

      </div>

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {rejectModal.open && (
        <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            <div className="p-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-4">

                    <Icon>
                      block
                    </Icon>

                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    {rejectModal.bulk
                      ? 'Reject Selected Listings'
                      : 'Reject Listing'}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {rejectModal.bulk
                      ? `You are about to reject ${selectedIds.length} selected listing${
                          selectedIds.length !== 1
                            ? 's'
                            : ''
                        }.`
                      : 'Confirm that you want to reject this listing.'}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRejectModal({
                      open: false,
                      product: null,
                      bulk: false,
                    })
                  }
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <Icon>
                    close
                  </Icon>
                </button>

              </div>

              {!rejectModal.bulk &&
                rejectModal.product && (
                  <div className="bg-slate-50 rounded-xl p-4 mt-5">

                    <p className="font-semibold text-sm text-slate-900">
                      {rejectModal.product?.title ||
                        'Untitled Product'}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Seller:{' '}
                      {getSellerName(
                        rejectModal.product
                      )}
                    </p>

                  </div>
                )}

              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-4">

                <p className="text-xs text-red-700 leading-5">
                  The selected listing
                  {rejectModal.bulk &&
                  selectedIds.length !== 1
                    ? 's'
                    : ''}{' '}
                  will be removed from the pending approval queue.
                </p>

              </div>

            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setRejectModal({
                    open: false,
                    product: null,
                    bulk: false,
                  })
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (rejectModal.bulk) {
                    handleRejectSelected();
                  } else {
                    handleReject(
                      rejectModal.product.id
                    );
                  }
                }}
                disabled={batchProcessing || processingId !== null}
                className="px-5 py-2.5 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-800 disabled:opacity-50"
              >
                {batchProcessing ||
                processingId !== null
                  ? 'Rejecting...'
                  : rejectModal.bulk
                    ? 'Reject Selected'
                    : 'Reject Listing'}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          INSPECT MODAL
      ===================================================== */}

      {inspectModal.open &&
        inspectModal.product && (
          <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">

              <div className="p-6">

                <div className="flex items-start justify-between gap-4 mb-6">

                  <div>

                    <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                      Product Listing
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {inspectModal.product?.title ||
                        'Untitled Product'}
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setInspectModal({
                        open: false,
                        product: null,
                      })
                    }
                    className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                  >
                    <Icon>
                      close
                    </Icon>
                  </button>

                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* IMAGE */}

                  <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-square">

                    {getImageUrl(
                      inspectModal.product
                    ) ? (
                      <img
                        src={getImageUrl(
                          inspectModal.product
                        )}
                        alt={
                          inspectModal.product?.title ||
                          'Product'
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">

                        <Icon className="text-5xl">
                          image
                        </Icon>

                      </div>
                    )}

                  </div>

                  {/* DETAILS */}

                  <div>

                    <div className="grid grid-cols-2 gap-3">

                      <div className="bg-slate-50 rounded-xl p-4">

                        <p className="text-[10px] uppercase text-slate-400">
                          Category
                        </p>

                        <p className="font-semibold text-sm mt-1">
                          {inspectModal.product?.category ||
                            inspectModal.product?.category_name ||
                            'Uncategorized'}
                        </p>

                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">

                        <p className="text-[10px] uppercase text-slate-400">
                          Condition
                        </p>

                        <p className="font-semibold text-sm mt-1">
                          {getCondition(
                            inspectModal.product
                          )}
                        </p>

                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">

                        <p className="text-[10px] uppercase text-slate-400">
                          Starting Price
                        </p>

                        <p className="font-semibold text-sm mt-1 text-emerald-800">
                          {formatNPR(
                            inspectModal.product?.starting_price ||
                              inspectModal.product?.startingPrice ||
                              0
                          )}
                        </p>

                      </div>

                      <div className="bg-slate-50 rounded-xl p-4">

                        <p className="text-[10px] uppercase text-slate-400">
                          Seller
                        </p>

                        <p className="font-semibold text-sm mt-1">
                          {getSellerName(
                            inspectModal.product
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 bg-slate-50 rounded-xl p-4">

                      <p className="text-[10px] uppercase text-slate-400">
                        Seller KYC
                      </p>

                      <p className="font-semibold text-sm mt-1">
                        {getKycLabel(
                          inspectModal.product
                        )}
                      </p>

                    </div>

                    <div className="mt-4">

                      <p className="text-[10px] uppercase text-slate-400">
                        Description
                      </p>

                      <p className="text-sm text-slate-600 leading-6 mt-2">
                        {inspectModal.product?.description ||
                          'No description provided.'}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* MODAL ACTIONS */}

              <div className="border-t border-slate-200 p-4 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setInspectModal({
                      open: false,
                      product: null,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRejectModal({
                      open: true,
                      product:
                        inspectModal.product,
                      bulk: false,
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-800"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApprove(
                      inspectModal.product.id
                    )
                  }
                  disabled={
                    processingId ===
                    inspectModal.product.id
                  }
                  className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-semibold hover:bg-emerald-950 disabled:opacity-50"
                >
                  {processingId ===
                  inspectModal.product.id
                    ? 'Approving...'
                    : 'Approve'}
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default AdminListings;
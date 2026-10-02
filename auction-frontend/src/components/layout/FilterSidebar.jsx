function FilterSidebar({
  maxPrice,
  setMaxPrice,
  city,
  setCity,
  cities,
  category,
  setCategory,
  categories,
  resetFilters,
  auctions = [],
}) {
  const getCityCount = (selectedCity) => {
    return auctions.filter(
      (auction) =>
        auction.product?.city === selectedCity &&
        auction.status === 'active'
    ).length;
  };

  const getCategoryCount = (selectedCategory) => {
    return auctions.filter(
      (auction) =>
        auction.product?.category === selectedCategory &&
        auction.status === 'active'
    ).length;
  };

  const activeAuctions = auctions.filter(
    (auction) => auction.status === 'active'
  );

  return (
    <aside className="w-full lg:w-[230px] shrink-0">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between mb-5">

          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="text-emerald-800">
              ☷
            </span>
            Filters
          </h2>

          <button
            onClick={resetFilters}
            className="text-[10px] text-emerald-700 font-semibold hover:underline"
          >
            Reset All
          </button>

        </div>

        {/* =================================================
            REGION / CITY
        ================================================= */}

        <div className="pb-5 border-b border-slate-100">

          <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-700 mb-3">
            Region / City
          </h3>

          <div className="space-y-2.5">

            {cities.length === 0 ? (

              <p className="text-xs text-slate-400">
                No cities available
              </p>

            ) : (

              cities.map((item) => {

                const checked = city === item;

                return (
                  <button
                    key={item}
                    onClick={() =>
                      setCity(checked ? '' : item)
                    }
                    className="w-full flex items-center justify-between gap-2 text-left"
                  >

                    <div className="flex items-center gap-2">

                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                          checked
                            ? 'bg-emerald-800 border-emerald-800 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {checked ? '✓' : ''}
                      </span>

                      <span className="text-xs text-slate-600">
                        {item}
                      </span>

                    </div>

                    <span className="bg-[#eef0ff] text-slate-500 px-2 py-0.5 rounded-full text-[9px]">
                      {getCityCount(item)}
                    </span>

                  </button>
                );
              })

            )}

          </div>

        </div>

        {/* =================================================
            CATEGORY
        ================================================= */}

        <div className="py-5 border-b border-slate-100">

          <div className="flex items-center justify-between mb-3">

            <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-700">
              Lot Category
            </h3>

            <span className="text-[9px] text-emerald-700">
              {activeAuctions.length} Active
            </span>

          </div>

          <div className="space-y-2.5">

            {categories.map((item) => {

              const checked = category === item;

              return (
                <button
                  key={item}
                  onClick={() =>
                    setCategory(checked ? '' : item)
                  }
                  className="w-full flex items-center justify-between gap-2 text-left"
                >

                  <div className="flex items-center gap-2">

                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        checked
                          ? 'bg-emerald-800 border-emerald-800 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {checked ? '✓' : ''}
                    </span>

                    <span className="text-xs text-slate-600">
                      {item}
                    </span>

                  </div>

                  <span className="text-[9px] text-slate-500">
                    {getCategoryCount(item)}
                  </span>

                </button>
              );
            })}

          </div>

        </div>

        {/* =================================================
            PRICE RANGE
        ================================================= */}

        <div className="py-5 border-b border-slate-100">

          <h3 className="text-[10px] text-gray-700 font-bold uppercase tracking-wide text-slate-700 mb-3">
            Current Bid Range (NPR ₨)
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-3">

            <div className="bg-[#f0f2ff] text-gray-900 rounded-lg p-2.5">

              <p className="text-[8px] text-slate-400 uppercase">
                Min Price
              </p>

              <p className="text-xs text-gray-900 font-semibold mt-1">
                ₨ 0
              </p>

            </div>

            <div className="bg-[#f0f2ff] text-gray-900 rounded-lg p-2.5">

              <p className="text-[8px] text-gray-900 text-slate-400 uppercase">
                Max Price
              </p>

              <p className="text-xs font-semibold mt-1">
                ₨ {maxPrice.toLocaleString('en-IN')}
              </p>

            </div>

          </div>

          <input
            type="range"
            min="0"
            max="1000000"
            step="5000"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(Number(e.target.value))
            }
            className="w-full accent-emerald-800"
          />

          <div className="flex justify-between text-gray-900 text-[9px] text-slate-400 mt-1">
            <span>₨ 0</span>
            <span>₨ 10L</span>
          </div>

          {/* QUICK PRICE FILTERS */}

          <div className="flex flex-wrap gap-1.5 mt-3">

            <button
              onClick={() => setMaxPrice(10000)}
              className="bg-[#eef0ff] hover:bg-emerald-100 text-gray-900 rounded-full px-2.5 py-1 text-[9px]"
            >
              ≤ ₨10k
            </button>

            <button
              onClick={() => setMaxPrice(50000)}
              className="bg-[#eef0ff] text-gray-900 hover:bg-emerald-100 rounded-full px-2.5 py-1 text-[9px]"
            >
              ₨10k – 50k
            </button>

            <button
              onClick={() => setMaxPrice(200000)}
              className="bg-[#eef0ff] text-gray-900 rounded-full px-2.5 py-1 text-[9px]"
            >
              ₨50k – 2L
            </button>

            <button
              onClick={() => setMaxPrice(1000000000)}
              className="bg-[#eef0ff] hover:bg-emerald-100 text-gray-900 rounded-full px-2.5 py-1 text-[9px]"
            >
              ₨2L+
            </button>

          </div>

        </div>

        {/* =================================================
            LOT CRITERIA
        ================================================= */}

        <div className="py-5 border-b border-slate-100">

          <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-700 mb-3">
            Lot Criteria
          </h3>

          <div className="space-y-3">

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">

              <input
                type="checkbox"
                className="accent-emerald-800"
              />

              Ending Soon
              <span className="text-[9px] text-slate-400">
                (&lt;3 Hours)
              </span>

            </label>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">

              <input
                type="checkbox"
                className="accent-emerald-800"
              />

              Reserve Price Met

            </label>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">

              <input
                type="checkbox"
                className="accent-emerald-800"
              />

              Bluebook / Bill Verified

            </label>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">

              <input
                type="checkbox"
                className="accent-emerald-800"
              />

              Free Kathmandu Pickup

            </label>

          </div>

        </div>

        {/* =================================================
            ITEM CONDITION
        ================================================= */}

        <div className="py-5">

          <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-700 mb-3">
            Item Condition
          </h3>

          <div className="space-y-3">

            <label className="flex items-center justify-between text-xs text-slate-600">

              <span className="flex items-center gap-2">

                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-emerald-800"
                />

                Like New / Mint

              </span>

              <span className="text-[9px] text-emerald-700">
                {activeAuctions.length}
              </span>

            </label>

            <label className="flex items-center justify-between text-xs text-slate-600">

              <span className="flex items-center gap-2">

                <input
                  type="checkbox"
                  className="accent-emerald-800"
                />

                Lightly Used

              </span>

              <span className="text-[9px] text-slate-500">
                —
              </span>

            </label>

            <label className="flex items-center justify-between text-xs text-slate-600">

              <span className="flex items-center gap-2">

                <input
                  type="checkbox"
                  className="accent-emerald-800"
                />

                Vintage / Refurbished

              </span>

              <span className="text-[9px] text-slate-500">
                —
              </span>

            </label>

          </div>

        </div>

      </div>

      {/* =================================================
          ESCROW SAFETY
      ================================================= */}

      <div className="bg-emerald-900 rounded-xl p-4 mt-4 text-white">

        <div className="flex items-center gap-2">

          <span className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            ◉
          </span>

          <p className="font-semibold text-xs">
            Nilaam Escrow Safety
          </p>

        </div>

        <p className="text-[10px] text-emerald-100 leading-4 mt-2">
          Funds are held securely via eSewa & Khalti until item inspection is completed at pickup.
        </p>

      </div>

    </aside>
  );
}

export default FilterSidebar;
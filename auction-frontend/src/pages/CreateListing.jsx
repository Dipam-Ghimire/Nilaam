import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../api/products";
const categories = [
  "Electronics",
  "Furniture",
  "Vehicles",
  "Collectibles",
  "Fashion",
  "Other",
];
const cities = [
  "Kathmandu",
  "Pokhara",
  "Lalitpur",
  "Bhaktapur",
  "Biratnagar",
  "Chitwan",
];
const conditions = [
  {
    value: "New",
    label: "Brand New",
    rating: "10/10",
    description: "Unused item in original or excellent factory condition.",
  },
  {
    value: "Like New",
    label: "Like New / Mint",
    rating: "9/10",
    description: "Minimal signs of use with excellent overall condition.",
  },
  {
    value: "Good",
    label: "Good",
    rating: "7–8/10",
    description: "Normal usage marks but fully functional and well maintained.",
  },
  {
    value: "Fair",
    label: "Fair",
    rating: "5–6/10",
    description: "Visible wear or imperfections but still usable.",
  },
  {
    value: "Used",
    label: "Used",
    rating: "3–4/10",
    description: "Clearly used with noticeable wear and possible defects.",
  },
];
function CreateListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [city, setCity] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  /* ============================================================ IMAGE HANDLING ============================================================ */ function handleImageChange(
    e,
  ) {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(
          `${file.name} is larger than 5MB. Please choose a smaller image.`,
        );
        return false;
      }
      return true;
    });
    if (!validFiles.length) return;
    const combinedFiles = [...images, ...validFiles].slice(0, 6);
    setImages(combinedFiles);
    const previews = combinedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    /* * Allow the same image to be selected again later. */ e.target.value =
      "";
  }
  function removeImage(index) {
    const newImages = images.filter((_, imageIndex) => imageIndex !== index);
    const newPreviews = imagePreviews.filter(
      (_, imageIndex) => imageIndex !== index,
    );
    setImages(newImages);
    setImagePreviews(newPreviews);
  }
  /* ============================================================ SUBMIT ============================================================ */ async function handleSubmit(
    e,
  ) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter an auction title.");
      return;
    }
    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }
    if (!condition) {
      alert("Please select the item condition.");
      return;
    }
    if (!city) {
      alert("Please select a city.");
      return;
    }
    if (!startingPrice || Number(startingPrice) <= 0) {
      alert("Please enter a valid starting price.");
      return;
    }
    if (!images.length) {
      alert("Please upload at least one product image.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("condition", condition);
      formData.append("city", city);
      formData.append("starting_price", Number(startingPrice));
      images.forEach((image) => {
        formData.append("images[]", image);
      });
      await createProduct(formData);
      alert(
        "Listing created successfully. You can now start an auction from your dashboard.",
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Create listing error:", error.response?.data || error);
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat()[0];
        alert(firstError || "Please check your information.");
      } else {
        alert(error.response?.data?.message || "Failed to create listing.");
      }
    } finally {
      setLoading(false);
    }
  }
  /* ============================================================ INPUT STYLE ============================================================ */ const inputClass = ` w-full rounded-xl border border-stone-200 bg-[#f4efe6] px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/10 `;
  return (
    <div className="min-h-screen bg-[#faf8ff] px-4 py-8 text-[#131b2e] sm:px-6 lg:px-8">
      {" "}
      <div className="mx-auto max-w-[1360px]">
        {" "}
        {/* ==================================================== BREADCRUMB ===================================================== */}{" "}
        <div className="mb-6 flex items-center gap-2 text-sm text-[#404941]">
          {" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="transition-colors hover:text-[#003b1b]"
          >
            {" "}
            Nilaam Hub{" "}
          </button>{" "}
          <span className="text-[#717970]"> › </span>{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="transition-colors hover:text-[#003b1b]"
          >
            {" "}
            Seller Dashboard{" "}
          </button>{" "}
          <span className="text-[#717970]"> › </span>{" "}
          <span className="font-semibold text-[#003b1b]">
            {" "}
            New Listing{" "}
          </span>{" "}
        </div>{" "}
        {/* ==================================================== HEADER ===================================================== */}{" "}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-[#f2f3ff] px-6 py-8 shadow-sm sm:px-8">
          {" "}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#a4f1b2]/30 blur-3xl" />{" "}
          <div className="pointer-events-none absolute -bottom-24 left-20 h-52 w-52 rounded-full bg-[#dae2fd]/50 blur-3xl" />{" "}
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            {" "}
            <div className="max-w-3xl">
              {" "}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#a4f1b2] px-3 py-1 text-xs font-semibold text-[#005226]">
                {" "}
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#1f6c3a]" />{" "}
                Seller Marketplace{" "}
              </div>{" "}
              <h1 className="text-3xl font-bold tracking-tight text-[#003b1b] sm:text-4xl">
                {" "}
                List an Item for Auction{" "}
              </h1>{" "}
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#404941]">
                {" "}
                Add your item details, upload clear photos, and prepare your
                product for a NILAAM auction.{" "}
              </p>{" "}
            </div>{" "}
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              {" "}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#a4f1b2] text-[#005226]">
                {" "}
                ✓{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="text-xs uppercase tracking-wide text-[#717970]">
                  {" "}
                  Seller{" "}
                </p>{" "}
                <p className="mt-1 text-sm font-semibold text-[#131b2e]">
                  {" "}
                  Verified Marketplace Listing{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* ==================================================== FORM ===================================================== */}{" "}
        <form onSubmit={handleSubmit}>
          {" "}
          <div className="grid items-start gap-7 lg:grid-cols-12">
            {" "}
            {/* ================================================== LEFT CONTENT =================================================== */}{" "}
            <div className="space-y-7 lg:col-span-8">
              {" "}
              {/* ================================================== ITEM ESSENTIALS =================================================== */}{" "}
              <section className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
                {" "}
                <div className="mb-6 flex items-center justify-between border-b border-[#e2e7ff] pb-5">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e2e7ff] text-[#003b1b]">
                      {" "}
                      🏷️{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h2 className="text-lg font-semibold text-[#131b2e]">
                        {" "}
                        Item Essentials{" "}
                      </h2>{" "}
                      <p className="mt-1 text-xs text-[#404941]">
                        {" "}
                        Basic information about your item.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#717970]">
                    {" "}
                    Step 1 of 4{" "}
                  </span>{" "}
                </div>{" "}
                <div className="space-y-5">
                  {" "}
                  {/* TITLE */}{" "}
                  <div>
                    {" "}
                    <div className="mb-2 flex items-center justify-between">
                      {" "}
                      <label
                        htmlFor="title"
                        className="text-xs font-semibold uppercase tracking-wide text-[#131b2e]"
                      >
                        {" "}
                        Auction Title{" "}
                        <span className="ml-1 text-red-600"> * </span>{" "}
                      </label>{" "}
                      <span className="text-xs text-[#717970]">
                        {" "}
                        {title.length} / 100{" "}
                      </span>{" "}
                    </div>{" "}
                    <input
                      id="title"
                      type="text"
                      maxLength={100}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sony Alpha A7 IV Mirrorless Camera"
                      className={inputClass}
                    />{" "}
                    <p className="mt-2 flex items-center gap-1 text-xs text-[#404941]">
                      {" "}
                      💡 Include the brand, model, edition, and important
                      accessories where possible.{" "}
                    </p>{" "}
                  </div>{" "}
                  {/* CATEGORY + CITY */}{" "}
                  <div className="grid gap-5 md:grid-cols-2">
                    {" "}
                    <div>
                      {" "}
                      <label
                        htmlFor="category"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#131b2e]"
                      >
                        {" "}
                        Category{" "}
                        <span className="ml-1 text-red-600"> * </span>{" "}
                      </label>{" "}
                      <div className="relative">
                        {" "}
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={`${inputClass} cursor-pointer appearance-none pr-10`}
                        >
                          {" "}
                          <option value=""> Select category </option>{" "}
                          {categories.map((item) => (
                            <option key={item} value={item}>
                              {" "}
                              {item}{" "}
                            </option>
                          ))}{" "}
                        </select>{" "}
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#717970]">
                          {" "}
                          ▼{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <label
                        htmlFor="city"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#131b2e]"
                      >
                        {" "}
                        City / Location{" "}
                        <span className="ml-1 text-red-600"> * </span>{" "}
                      </label>{" "}
                      <div className="relative">
                        {" "}
                        <select
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`${inputClass} cursor-pointer appearance-none pr-10`}
                        >
                          {" "}
                          <option value=""> Select city </option>{" "}
                          {cities.map((item) => (
                            <option key={item} value={item}>
                              {" "}
                              {item}{" "}
                            </option>
                          ))}{" "}
                        </select>{" "}
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#717970]">
                          {" "}
                          ▼{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* ================================================== CONDITION RATING MATRIX =================================================== */}{" "}
                  <div className="pt-2">
                    {" "}
                    <div className="mb-2 flex items-center justify-between">
                      {" "}
                      <label className="text-xs font-semibold uppercase tracking-wide text-[#131b2e]">
                        {" "}
                        Condition Rating{" "}
                        <span className="ml-1 text-red-600"> * </span>{" "}
                      </label>{" "}
                      <span className="text-[11px] font-semibold text-[#1f6c3a]">
                        {" "}
                        Inspected standard applied{" "}
                      </span>{" "}
                    </div>{" "}
                    {/* CONDITION CARDS */}{" "}
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {" "}
                      {conditions.map((item) => {
                        const isSelected = condition === item.value;
                        return (
                          <label
                            key={item.value}
                            className="group relative cursor-pointer"
                          >
                            {" "}
                            <input
                              type="radio"
                              name="condition"
                              value={item.value}
                              checked={isSelected}
                              onChange={(e) => setCondition(e.target.value)}
                              className="peer sr-only"
                            />{" "}
                            <div
                              className={` flex h-full flex-col justify-between rounded-xl p-4 transition-all duration-200 ${isSelected ? "bg-[#a4f1b2] shadow-sm ring-1 ring-[#1f6c3a]/20" : "bg-[#f2f3ff] hover:bg-[#e2e7ff]"} `}
                            >
                              {" "}
                              <div className="flex items-center justify-between gap-2">
                                {" "}
                                <span
                                  className={` text-xs font-semibold ${isSelected ? "text-[#003b1b]" : "text-[#131b2e]"} `}
                                >
                                  {" "}
                                  {item.label}{" "}
                                </span>{" "}
                                <span
                                  className={` rounded-full px-2 py-0.5 text-[10px] font-bold ${isSelected ? "bg-white/70 text-[#005226]" : "bg-white text-[#1f6c3a]"} `}
                                >
                                  {" "}
                                  {item.rating}{" "}
                                </span>{" "}
                              </div>{" "}
                              <p
                                className={` mt-2 text-[11px] leading-snug ${isSelected ? "text-[#12512c]" : "text-[#404941]"} `}
                              >
                                {" "}
                                {item.description}{" "}
                              </p>{" "}
                              {/* Selected indicator */}{" "}
                              {isSelected && (
                                <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#005226]">
                                  {" "}
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#003b1b] text-white">
                                    {" "}
                                    ✓{" "}
                                  </span>{" "}
                                  Selected{" "}
                                </div>
                              )}{" "}
                            </div>{" "}
                          </label>
                        );
                      })}{" "}
                    </div>{" "}
                    {!condition && (
                      <p className="mt-2 text-xs text-[#717970]">
                        {" "}
                        Select the condition that most accurately represents
                        your item.{" "}
                      </p>
                    )}{" "}
                  </div>{" "}
                  {/* DESCRIPTION */}{" "}
                  <div>
                    {" "}
                    <div className="mb-2 flex items-center justify-between">
                      {" "}
                      <label
                        htmlFor="description"
                        className="text-xs font-semibold uppercase tracking-wide text-[#131b2e]"
                      >
                        {" "}
                        Description{" "}
                        <span className="ml-1 text-red-600"> * </span>{" "}
                      </label>{" "}
                      <span className="text-xs text-[#717970]">
                        {" "}
                        {description.length} / 2000{" "}
                      </span>{" "}
                    </div>{" "}
                    <textarea
                      id="description"
                      rows={7}
                      maxLength={2000}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the item's condition, history, included accessories, defects, usage, and any other important information bidders should know..."
                      className={`${inputClass} resize-none`}
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </section>{" "}
              {/* ================================================== IMAGES =================================================== */}{" "}
              <section className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
                {" "}
                <div className="mb-6 flex items-center justify-between border-b border-[#e2e7ff] pb-5">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e2e7ff] text-[#003b1b]">
                      {" "}
                      📷{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h2 className="text-lg font-semibold text-[#131b2e]">
                        {" "}
                        Auction Gallery{" "}
                      </h2>{" "}
                      <p className="mt-1 text-xs text-[#404941]">
                        {" "}
                        Upload clear photos of your item.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <span className="rounded-full bg-[#e2e7ff] px-3 py-1 text-xs font-bold text-[#1f6c3a]">
                    {" "}
                    {images.length} / 6{" "}
                  </span>{" "}
                </div>{" "}
                {/* UPLOAD */}{" "}
                <label
                  htmlFor="images"
                  className=" group relative flex cursor-pointer flex-col items-center justify-center rounded-xl bg-[#f2f3ff] px-6 py-10 text-center transition-colors hover:bg-[#e2e7ff] "
                >
                  {" "}
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#a4f1b2] text-2xl text-[#005226] transition-transform group-hover:scale-110">
                    {" "}
                    ☁{" "}
                  </div>{" "}
                  <p className="text-sm font-semibold text-[#131b2e]">
                    {" "}
                    Click to upload product images{" "}
                  </p>{" "}
                  <p className="mt-1 text-xs text-[#717970]">
                    {" "}
                    JPG, JPEG, PNG • Maximum 5MB each{" "}
                  </p>{" "}
                  <p className="mt-2 text-xs font-medium text-[#1f6c3a]">
                    {" "}
                    Clear photos increase bidder confidence.{" "}
                  </p>{" "}
                  <input
                    id="images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />{" "}
                </label>{" "}
                {/* PREVIEWS */}{" "}
                {imagePreviews.length > 0 && (
                  <div className="mt-5">
                    {" "}
                    <div className="mb-3 flex items-center justify-between">
                      {" "}
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#131b2e]">
                        {" "}
                        Gallery Preview{" "}
                      </span>{" "}
                      <span className="text-xs text-[#717970]">
                        {" "}
                        First image is the main image{" "}
                      </span>{" "}
                    </div>{" "}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {" "}
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`${preview}-${index}`}
                          className="group relative overflow-hidden rounded-xl bg-[#e2e7ff] shadow-sm"
                        >
                          {" "}
                          <img
                            src={preview}
                            alt={`Product preview ${index + 1}`}
                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />{" "}
                          {index === 0 && (
                            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#003b1b] px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                              {" "}
                              ★ Cover Photo{" "}
                            </span>
                          )}{" "}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className=" absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-white "
                            aria-label={`Remove image ${index + 1}`}
                          >
                            {" "}
                            ×{" "}
                          </button>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </section>{" "}
              {/* ================================================== STARTING PRICE =================================================== */}{" "}
              <section className="rounded-2xl bg-white p-6 shadow-md">
                {" "}
                <div className="mb-6 border-b border-[#e2e7ff] pb-5">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e2e7ff] text-[#003b1b]">
                      {" "}
                      ₹{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h2 className="text-lg font-semibold text-[#131b2e]">
                        {" "}
                        Auction Pricing{" "}
                      </h2>{" "}
                      <p className="mt-1 text-xs text-[#404941]">
                        {" "}
                        Set the minimum amount from which your auction should
                        begin.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="max-w-md">
                  {" "}
                  <label
                    htmlFor="startingPrice"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#131b2e]"
                  >
                    {" "}
                    Starting Price (NPR){" "}
                    <span className="ml-1 text-red-600"> * </span>{" "}
                  </label>{" "}
                  <div className="flex overflow-hidden rounded-xl bg-[#f2f3ff] shadow-inner">
                    {" "}
                    <div className="flex items-center gap-1 bg-[#e2e7ff] px-4 py-3 text-sm font-bold text-[#003b1b]">
                      {" "}
                      <span>रू</span>{" "}
                      <span className="text-[10px] font-normal text-[#404941]">
                        {" "}
                        NPR{" "}
                      </span>{" "}
                    </div>{" "}
                    <input
                      id="startingPrice"
                      type="number"
                      min="1"
                      step="1"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-transparent px-4 py-3 text-lg font-semibold text-[#131b2e] outline-none placeholder:text-[#717970]"
                    />{" "}
                  </div>{" "}
                  <p className="mt-2 text-xs text-[#404941]">
                    {" "}
                    This is the opening price. Bidders may increase the price
                    during the auction.{" "}
                  </p>{" "}
                </div>{" "}
              </section>{" "}
            </div>{" "}
            {/* ================================================== RIGHT SIDEBAR =================================================== */}{" "}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:col-span-4">
              {" "}
              {/* ================================================== BID RULES / SUMMARY =================================================== */}{" "}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                {" "}
                <div className="mb-5 flex items-center justify-between">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <span className="text-xl"> ⚖ </span>{" "}
                    <h2 className="text-lg font-semibold text-[#131b2e]">
                      {" "}
                      Listing Summary{" "}
                    </h2>{" "}
                  </div>{" "}
                  <span className="rounded-full bg-[#a4f1b2] px-2 py-1 text-[10px] font-bold text-[#005226]">
                    {" "}
                    READY{" "}
                  </span>{" "}
                </div>{" "}
                <div className="space-y-4">
                  {" "}
                  <div className="flex items-start justify-between gap-3">
                    {" "}
                    <span className="text-xs text-[#717970]"> Title </span>{" "}
                    <span className="max-w-[210px] text-right text-xs font-medium text-[#131b2e]">
                      {" "}
                      {title || "Not provided"}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="h-px bg-[#e2e7ff]" />{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-xs text-[#717970]">
                      {" "}
                      Category{" "}
                    </span>{" "}
                    <span className="text-xs font-medium text-[#131b2e]">
                      {" "}
                      {category || "Not selected"}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-xs text-[#717970]">
                      {" "}
                      Condition{" "}
                    </span>{" "}
                    <span
                      className={` rounded-full px-2 py-1 text-[10px] font-semibold ${condition ? "bg-[#a4f1b2] text-[#005226]" : "bg-[#e2e7ff] text-[#717970]"} `}
                    >
                      {" "}
                      {condition || "Not selected"}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-xs text-[#717970]">
                      {" "}
                      Location{" "}
                    </span>{" "}
                    <span className="text-xs font-medium text-[#131b2e]">
                      {" "}
                      {city || "Not selected"}{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="text-xs text-[#717970]">
                      {" "}
                      Images{" "}
                    </span>{" "}
                    <span className="text-xs font-medium text-[#131b2e]">
                      {" "}
                      {images.length} / 6{" "}
                    </span>{" "}
                  </div>{" "}
                  <div className="h-px bg-[#e2e7ff]" /> {/* PRICE */}{" "}
                  <div className="rounded-xl bg-[#f2f3ff] p-4">
                    {" "}
                    <p className="text-[10px] uppercase tracking-wide text-[#717970]">
                      {" "}
                      Starting Price{" "}
                    </p>{" "}
                    <p className="mt-1 text-2xl font-bold text-[#003b1b]">
                      {" "}
                      रू{" "}
                      {startingPrice
                        ? Number(startingPrice).toLocaleString("en-NP")
                        : "0"}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                {/* CREATE BUTTON */}{" "}
                <button
                  type="submit"
                  disabled={loading}
                  className=" mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003b1b] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1f6c3a] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 "
                >
                  {" "}
                  {loading ? "Creating Listing..." : "Create Listing"}{" "}
                  {!loading && <span> → </span>}{" "}
                </button>{" "}
                {/* CANCEL */}{" "}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => navigate("/dashboard")}
                  className=" mt-2 w-full rounded-xl bg-[#f2f3ff] px-5 py-3 text-sm font-medium text-[#131b2e] transition hover:bg-[#e2e7ff] disabled:opacity-50 "
                >
                  {" "}
                  Cancel{" "}
                </button>{" "}
              </div>{" "}
              {/* ================================================== AUCTION FLOW =================================================== */}{" "}
              <div className="rounded-2xl bg-white p-5 shadow-md">
                {" "}
                <h3 className="text-sm font-bold text-[#131b2e]">
                  {" "}
                  What happens next?{" "}
                </h3>{" "}
                <div className="mt-4 space-y-4">
                  {" "}
                  <div className="flex gap-3">
                    {" "}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a4f1b2] text-xs font-bold text-[#005226]">
                      {" "}
                      1{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-xs font-semibold text-[#131b2e]">
                        {" "}
                        Create Listing{" "}
                      </p>{" "}
                      <p className="mt-0.5 text-[11px] leading-4 text-[#404941]">
                        {" "}
                        Submit your item information and photos.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex gap-3">
                    {" "}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a4f1b2] text-xs font-bold text-[#005226]">
                      {" "}
                      2{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-xs font-semibold text-[#131b2e]">
                        {" "}
                        Listing Review{" "}
                      </p>{" "}
                      <p className="mt-0.5 text-[11px] leading-4 text-[#404941]">
                        {" "}
                        Your listing can be reviewed by the marketplace.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex gap-3">
                    {" "}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a4f1b2] text-xs font-bold text-[#005226]">
                      {" "}
                      3{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-xs font-semibold text-[#131b2e]">
                        {" "}
                        Start Auction{" "}
                      </p>{" "}
                      <p className="mt-0.5 text-[11px] leading-4 text-[#404941]">
                        {" "}
                        Set the auction schedule and begin receiving bids.{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </aside>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
export default CreateListing;

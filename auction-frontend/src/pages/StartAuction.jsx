import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createAuction } from "../api/products";

function StartAuction() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [type, setType] = useState("timed");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * Convert Date object to the format required by
   * <input type="datetime-local">
   *
   * This uses the browser's LOCAL timezone.
   */
  function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /*
   * Get the actual start Date.
   *
   * If the user leaves Start Time empty,
   * the auction starts NOW.
   */
  function getStartDate() {
    if (!startTime) {
      return new Date();
    }

    const date = new Date(startTime);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  /*
   * Calculate End Time.
   *
   * IMPORTANT:
   * There is NO maximum duration here.
   *
   * 5 minutes     -> allowed
   * 60 minutes    -> allowed
   * 120 minutes   -> allowed
   * 500 minutes   -> allowed
   * 1000 minutes  -> allowed
   */
  useEffect(() => {
    if (type !== "timed") {
      setEndTime("");
      return;
    }

    const durationMinutes = Number(duration);

    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 5
    ) {
      setEndTime("");
      return;
    }

    const start = getStartDate();

    if (!start) {
      setEndTime("");
      return;
    }

    const end = new Date(
      start.getTime() + durationMinutes * 60 * 1000
    );

    setEndTime(formatDateTimeLocal(end));
  }, [startTime, duration, type]);

  async function handleSubmit(e) {
    e.preventDefault();

    const durationMinutes = Number(duration);

    /*
     * Only minimum duration is enforced.
     *
     * There is NO 60-minute maximum.
     */
    if (
      type === "timed" &&
      (!Number.isFinite(durationMinutes) ||
        durationMinutes < 5)
    ) {
      alert("Auction duration must be at least 5 minutes.");
      return;
    }

    /*
     * Get start time.
     *
     * Empty = NOW.
     */
    const start = getStartDate();

    if (!start) {
      alert("Please provide a valid start time.");
      return;
    }

    /*
     * If a manual start time was entered and it is
     * already in the past, don't create an auction
     * that has already started/expired unexpectedly.
     *
     * Small clock differences are tolerated.
     */
    if (startTime) {
      const now = new Date();

      if (start.getTime() < now.getTime() - 60000) {
        alert(
          "The selected start time is already in the past. Please choose a future time."
        );
        return;
      }
    }

    /*
     * Calculate end time from the SAME start Date.
     */
    const end =
      type === "timed"
        ? new Date(
            start.getTime() +
              durationMinutes * 60 * 1000
          )
        : null;

    if (!end) {
      alert("An auction must have an end time.");
      return;
    }

    if (end.getTime() <= start.getTime()) {
      alert("End time must be after the start time.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * Send ISO UTC timestamps to Laravel.
       *
       * Example:
       *
       * Nepal:
       * 2026-10-02 07:36
       *
       * Sent to API:
       * 2026-10-02T01:51:00.000Z
       *
       * The backend should store these timestamps
       * consistently as UTC.
       */
      const data = {
        product_id: Number(productId),
        type: type,

        start_time: start.toISOString(),
        end_time: end.toISOString(),

        /*
         * Sending duration as well makes backend
         * validation/debugging easier.
         */
        duration: durationMinutes,
      };

      console.log("Creating auction:");
      console.log({
        ...data,
        start_local: start.toLocaleString(),
        end_local: end.toLocaleString(),
      });

      const response = await createAuction(data);

      console.log("Auction created:", response.data);

      alert("Auction created successfully!");

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Auction creation error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Something went wrong while creating the auction."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Start Auction
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Auction Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Auction Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            <option value="timed">
              Timed Auction
            </option>
          </select>

          <p className="text-xs text-gray-500 mt-1">
            NILAAM auctions run for a fixed period and automatically
            close when the end time is reached.
          </p>
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Start Time
          </label>

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />

          <p className="text-xs text-gray-500 mt-1">
            Leave empty to start the auction immediately.
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Auction Duration
          </label>

          <div className="flex gap-2">
            <input
              type="number"
              min="5"
              step="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputClass}
              placeholder="60"
              required
            />

            <div className="flex items-center px-4 border border-gray-300 rounded bg-gray-100 text-gray-700">
              Minutes
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Auction duration must be at least 5 minutes. You can
            choose any duration you want.
          </p>
        </div>

        {/* Calculated End Time */}
        <div>
          <label className="block text-sm font-medium mb-1">
            End Time
          </label>

          <input
            type="datetime-local"
            value={endTime}
            readOnly
            className={`${inputClass} bg-gray-100`}
          />

          <p className="text-xs text-gray-500 mt-1">
            End time is automatically calculated from the start
            time and auction duration.
          </p>
        </div>

        {/* Summary */}
        {endTime && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              Auction Summary
            </h2>

            <p className="text-sm text-blue-800">
              Duration: {duration} minutes
            </p>

            <p className="text-sm text-blue-800">
              The auction will automatically close at:
            </p>

            <p className="font-semibold text-blue-900 mt-1">
              {(() => {
                const start = startTime
                  ? new Date(startTime)
                  : new Date();

                const end = new Date(
                  start.getTime() +
                    Number(duration) * 60 * 1000
                );

                return end.toLocaleString();
              })()}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Starting Auction..."
            : "Start Auction"}
        </button>

      </form>
    </div>
  );
}

export default StartAuction;
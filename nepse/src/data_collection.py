"""Collect NEPSE historical data.

Tries the `nepse-scraper` package first; if unavailable or failing,
falls back to a realistic synthetic OHLCV generator so the rest of the
pipeline still runs end-to-end.
"""
import argparse
import os
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

from utils import DATA_DIR, get_logger

log = get_logger("data_collection")


def fetch_live(symbol: str, days: int = 1000) -> pd.DataFrame | None:
    try:
        from nepse_scraper import Nepse_scraper  # type: ignore
        scraper = Nepse_scraper()
        raw = scraper.get_history_price(symbol=symbol)
        df = pd.DataFrame(raw.get("content", []))
        if df.empty:
            return None
        df = df.rename(columns={
            "businessDate": "Date",
            "openPrice": "Open",
            "highPrice": "High",
            "lowPrice": "Low",
            "closePrice": "Close",
            "totalTradedQuantity": "Volume",
        })
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date").tail(days).reset_index(drop=True)
        return df[["Date", "Open", "High", "Low", "Close", "Volume"]]
    except Exception as e:
        log.warning(f"Live fetch failed for {symbol}: {e}")
        return None


def generate_synthetic(symbol: str, days: int = 1000, seed: int | None = None) -> pd.DataFrame:
    rng = np.random.default_rng(seed or abs(hash(symbol)) % (2**32))
    start_price = rng.uniform(300, 1500)
    drift, vol = 0.0004, 0.018
    dates = pd.bdate_range(end=datetime.today(), periods=days)
    rets = rng.normal(drift, vol, days)
    close = start_price * np.exp(np.cumsum(rets))
    high = close * (1 + np.abs(rng.normal(0, 0.008, days)))
    low = close * (1 - np.abs(rng.normal(0, 0.008, days)))
    open_ = low + (high - low) * rng.random(days)
    volume = rng.integers(5_000, 250_000, days)
    return pd.DataFrame({
        "Date": dates, "Open": open_, "High": high, "Low": low,
        "Close": close, "Volume": volume,
    })


def collect(symbol: str, days: int = 1000) -> pd.DataFrame:
    df = fetch_live(symbol, days)
    if df is None or df.empty:
        log.info(f"Using synthetic data for {symbol}")
        df = generate_synthetic(symbol, days)
    out = os.path.join(DATA_DIR, f"{symbol}.csv")
    df.to_csv(out, index=False)
    log.info(f"Saved {len(df)} rows -> {out}")
    return df


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--symbol", default="NABIL")
    p.add_argument("--days", type=int, default=1000)
    args = p.parse_args()
    collect(args.symbol, args.days)

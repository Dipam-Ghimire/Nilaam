"""Technical-indicator feature engineering for NEPSE OHLCV data."""
import numpy as np
import pandas as pd


def _rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def _macd(close: pd.Series, fast=12, slow=26, signal=9):
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    sig = macd.ewm(span=signal, adjust=False).mean()
    return macd, sig, macd - sig


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy().sort_values("Date").reset_index(drop=True)
    c = df["Close"]
    for w in (5, 10, 20, 50):
        df[f"MA_{w}"] = c.rolling(w).mean()
        df[f"EMA_{w}"] = c.ewm(span=w, adjust=False).mean()
    df["RSI_14"] = _rsi(c, 14)
    macd, sig, hist = _macd(c)
    df["MACD"], df["MACD_Signal"], df["MACD_Hist"] = macd, sig, hist
    df["Return"] = c.pct_change()
    df["Volatility_10"] = df["Return"].rolling(10).std()
    df["Volatility_20"] = df["Return"].rolling(20).std()
    for lag in (1, 2, 3, 5, 10):
        df[f"Close_Lag_{lag}"] = c.shift(lag)
        df[f"Return_Lag_{lag}"] = df["Return"].shift(lag)
    df["HL_Spread"] = (df["High"] - df["Low"]) / c
    df["OC_Spread"] = (df["Close"] - df["Open"]) / df["Open"]
    df["Volume_MA_10"] = df["Volume"].rolling(10).mean()
    df["Target"] = c.shift(-1)
    return df.dropna().reset_index(drop=True)


FEATURE_COLS = [
    "Open", "High", "Low", "Close", "Volume",
    "MA_5", "MA_10", "MA_20", "MA_50",
    "EMA_5", "EMA_10", "EMA_20", "EMA_50",
    "RSI_14", "MACD", "MACD_Signal", "MACD_Hist",
    "Return", "Volatility_10", "Volatility_20",
    "Close_Lag_1", "Close_Lag_2", "Close_Lag_3", "Close_Lag_5", "Close_Lag_10",
    "Return_Lag_1", "Return_Lag_2", "Return_Lag_3", "Return_Lag_5", "Return_Lag_10",
    "HL_Spread", "OC_Spread", "Volume_MA_10",
]

"""Clean and prepare raw NEPSE OHLCV data."""
import pandas as pd


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date").drop_duplicates(subset="Date")
    for c in ["Open", "High", "Low", "Close", "Volume"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df = df.dropna(subset=["Close"]).reset_index(drop=True)
    df = df.ffill().bfill()
    return df


def train_test_split_time(df: pd.DataFrame, test_size: float = 0.2):
    n = len(df)
    cut = int(n * (1 - test_size))
    return df.iloc[:cut].copy(), df.iloc[cut:].copy()

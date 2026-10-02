"""Generate future price forecasts using a trained model."""
import argparse
import os
import numpy as np
import pandas as pd
import joblib

from data_collection import collect
from preprocessing import clean
from feature_engineering import add_features, FEATURE_COLS
from utils import MODELS_DIR, get_logger

log = get_logger("predict")


def forecast(symbol: str, horizon: int = 30, model_name: str = "xgboost") -> pd.DataFrame:
    raw = collect(symbol)
    df = add_features(clean(raw))

    path = os.path.join(MODELS_DIR, f"{symbol}_{model_name}.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Train first: {path} missing")
    model = joblib.load(path)

    history = df.copy()
    future_dates, future_preds = [], []
    last_date = history["Date"].iloc[-1]

    for i in range(horizon):
        # 1. Generate features on current history state
        df_with_features = add_features(clean(history[["Date", "Open", "High", "Low", "Close", "Volume"]]))
        
        # 2. Extract features and predict
        row = df_with_features.iloc[[-1]][FEATURE_COLS]
        pred = float(model.predict(row)[0])
        
        # 3. Advance business date safely
        next_date = history["Date"].iloc[-1] + pd.tseries.offsets.BDay(1)
        
        future_dates.append(next_date)
        future_preds.append(pred)
        
        # 4. Naive roll with slight realistic variations so features shift
        prev_close = history["Close"].iloc[-1]
        new = history.iloc[-1].copy()
        new["Date"] = next_date
        
        # Instead of setting everything strictly to 'pred', simulate a realistic candle 
        # to force rolling technical indicators (RSI, Moving Averages) to actually change value.
        new["Close"] = pred
        new["Open"] = prev_close  # Today's open is yesterday's close
        new["High"] = max(pred, prev_close) * 1.001 
        new["Low"] = min(pred, prev_close) * 0.999
        new["Volume"] = history["Volume"].mean() # Use an average volume instead of static last-row volume
        
        history = pd.concat([history, pd.DataFrame([new])], ignore_index=True)

    return pd.DataFrame({"Date": future_dates, "Predicted_Close": future_preds})


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--symbol", default="NABIL")
    p.add_argument("--horizon", type=int, default=30)
    p.add_argument("--model", default="xgboost")
    args = p.parse_args()
    out = forecast(args.symbol, args.horizon, args.model)
    print(out.to_string(index=False))

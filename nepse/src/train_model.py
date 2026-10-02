"""Train and evaluate ML/DL models for NEPSE stock-price prediction."""
import argparse
import os
import json

import numpy as np
import pandas as pd
import joblib

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from data_collection import collect
from preprocessing import clean, train_test_split_time
from feature_engineering import add_features, FEATURE_COLS
from utils import MODELS_DIR, get_logger

log = get_logger("train_model")


def _metrics(y_true, y_pred):
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    mape = float(np.mean(np.abs((y_true - y_pred) / np.where(y_true == 0, 1e-9, y_true))) * 100)
    return {"RMSE": rmse, "MAE": mae, "R2": r2, "MAPE": mape}


def train_classical(symbol: str, df: pd.DataFrame):
    train, test = train_test_split_time(df, 0.2)
    X_tr, y_tr = train[FEATURE_COLS], train["Target"]
    X_te, y_te = test[FEATURE_COLS], test["Target"]

    results = {}
    models = {
        "linear_regression": LinearRegression(),
        "random_forest": RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
    }
    try:
        from xgboost import XGBRegressor
        models["xgboost"] = XGBRegressor(
            n_estimators=400, learning_rate=0.05, max_depth=5,
            subsample=0.9, colsample_bytree=0.9, random_state=42, n_jobs=-1,
        )
    except Exception as e:
        log.warning(f"XGBoost not available: {e}")

    for name, model in models.items():
        model.fit(X_tr, y_tr)
        pred = model.predict(X_te)
        results[name] = _metrics(y_te.values, pred)
        joblib.dump(model, os.path.join(MODELS_DIR, f"{symbol}_{name}.pkl"))
        log.info(f"{name}: {results[name]}")
    return results


def train_lstm(symbol: str, df: pd.DataFrame, window: int = 30, epochs: int = 20):
    try:
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
    except Exception as e:
        log.warning(f"TensorFlow not available, skipping LSTM: {e}")
        return None

    closes = df["Close"].values.reshape(-1, 1)
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(closes)

    X, y = [], []
    for i in range(window, len(scaled)):
        X.append(scaled[i - window:i, 0])
        y.append(scaled[i, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    cut = int(len(X) * 0.8)
    X_tr, X_te, y_tr, y_te = X[:cut], X[cut:], y[:cut], y[cut:]

    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(window, 1)),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(1),
    ])
    model.compile(optimizer="adam", loss="mse")
    model.fit(X_tr, y_tr, epochs=epochs, batch_size=32, verbose=0,
              validation_data=(X_te, y_te))

    pred = scaler.inverse_transform(model.predict(X_te).reshape(-1, 1)).flatten()
    y_true = scaler.inverse_transform(y_te.reshape(-1, 1)).flatten()

    model.save(os.path.join(MODELS_DIR, f"{symbol}_lstm.h5"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, f"{symbol}_lstm_scaler.pkl"))
    metrics = _metrics(y_true, pred)
    log.info(f"lstm: {metrics}")
    return metrics


def main(symbol: str):
    raw = collect(symbol)
    df = add_features(clean(raw))
    results = train_classical(symbol, df)
    lstm = train_lstm(symbol, df)
    if lstm:
        results["lstm"] = lstm
    out = os.path.join(MODELS_DIR, f"{symbol}_metrics.json")
    with open(out, "w") as f:
        json.dump(results, f, indent=2)
    log.info(f"Metrics saved -> {out}")
    return results


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--symbol", default="NABIL")
    args = p.parse_args()
    main(args.symbol)

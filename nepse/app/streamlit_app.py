"""NEPSE Stock Price Predictor — Streamlit dashboard."""
import os
import sys
import json

import pandas as pd
import numpy as np
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from data_collection import collect          # noqa: E402
from preprocessing import clean              # noqa: E402
from feature_engineering import add_features # noqa: E402
from predict import forecast                 # noqa: E402
from train_model import main as train_main   # noqa: E402
from utils import NEPSE_COMPANIES, MODELS_DIR  # noqa: E402

st.set_page_config(page_title="NEPSE Predictor", page_icon="📈", layout="wide")

st.sidebar.title("📈 NEPSE Predictor")
page = st.sidebar.radio("Navigate", ["Market Overview", "Technical Analysis", "Forecast", "Train Models"])
symbol = st.sidebar.selectbox("Company", NEPSE_COMPANIES)

@st.cache_data(show_spinner=False)
def load(sym):
    return add_features(clean(collect(sym)))

df = load(symbol)

if page == "Market Overview":
    st.title(f"{symbol} — Market Overview")
    c1, c2, c3, c4 = st.columns(4)
    last, prev = df["Close"].iloc[-1], df["Close"].iloc[-2]
    c1.metric("Last Close", f"NPR {last:,.2f}", f"{(last - prev):+.2f}")
    c2.metric("52W High", f"{df['High'].tail(252).max():,.2f}")
    c3.metric("52W Low", f"{df['Low'].tail(252).min():,.2f}")
    c4.metric("Avg Volume", f"{df['Volume'].tail(30).mean():,.0f}")

    fig = go.Figure(data=[go.Candlestick(
        x=df["Date"], open=df["Open"], high=df["High"],
        low=df["Low"], close=df["Close"],
    )])
    fig.update_layout(height=500, title="Price (Candlestick)")
    st.plotly_chart(fig, use_container_width=True)

elif page == "Technical Analysis":
    st.title(f"{symbol} — Technical Analysis")
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df["Date"], y=df["Close"], name="Close"))
    for w in (20, 50):
        fig.add_trace(go.Scatter(x=df["Date"], y=df[f"MA_{w}"], name=f"MA {w}"))
    fig.update_layout(height=450, title="Close & Moving Averages")
    st.plotly_chart(fig, use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(x=df["Date"], y=df["RSI_14"], name="RSI"))
        fig2.add_hline(y=70, line_dash="dash", line_color="red")
        fig2.add_hline(y=30, line_dash="dash", line_color="green")
        fig2.update_layout(height=300, title="RSI (14)")
        st.plotly_chart(fig2, use_container_width=True)
    with col2:
        fig3 = go.Figure()
        fig3.add_trace(go.Scatter(x=df["Date"], y=df["MACD"], name="MACD"))
        fig3.add_trace(go.Scatter(x=df["Date"], y=df["MACD_Signal"], name="Signal"))
        fig3.update_layout(height=300, title="MACD")
        st.plotly_chart(fig3, use_container_width=True)

elif page == "Forecast":
    st.title(f"{symbol} — Price Forecast")
    horizon = st.selectbox("Horizon (days)", [7, 15, 30], index=2)
    model_name = st.selectbox("Model", ["xgboost", "random_forest", "linear_regression"])
    if st.button("Run Forecast"):
        try:
            fc = forecast(symbol, horizon, model_name)
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=df["Date"].tail(120), y=df["Close"].tail(120), name="Historical"))
            fig.add_trace(go.Scatter(x=fc["Date"], y=fc["Predicted_Close"], name="Forecast", line=dict(dash="dash")))
            fig.update_layout(height=500, title=f"{horizon}-Day Forecast ({model_name})")
            st.plotly_chart(fig, use_container_width=True)
            st.dataframe(fc, use_container_width=True)
        except FileNotFoundError:
            st.error("Model not trained yet. Go to 'Train Models' tab first.")

elif page == "Train Models":
    st.title(f"Train Models — {symbol}")
    st.write("Trains Linear Regression, Random Forest, XGBoost, and LSTM on the latest data.")
    if st.button("Start Training"):
        with st.spinner("Training… this may take a few minutes (LSTM is slowest)"):
            results = train_main(symbol)
        st.success("Training complete")
        st.json(results)

    mpath = os.path.join(MODELS_DIR, f"{symbol}_metrics.json")
    if os.path.exists(mpath):
        with open(mpath) as f:
            st.subheader("Latest metrics")
            st.json(json.load(f))

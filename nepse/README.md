# NEPSE Stock Price Predictor

A complete data science project that collects Nepal Stock Exchange (NEPSE) data, performs EDA, feature engineering, and trains ML/DL models (Linear Regression, Random Forest, XGBoost, LSTM) to predict future stock prices. Ships with an interactive Streamlit dashboard.

## Features
- **Live data collection** from NEPSE via `nepse-scraper` (with synthetic fallback)
- **Feature engineering**: MA, EMA, RSI, MACD, lag features, volatility
- **Models**: Linear Regression, Random Forest, XGBoost, LSTM
- **Evaluation**: RMSE, MAE, R², MAPE
- **Streamlit dashboard**: market overview, technical analysis, forecasts (7/15/30 days)
- **Reports**: auto-generated DOCX project report and PPTX presentation

## Recommended companies
NABIL, NICA, NRIC, CIT, SHIVM, HIDCL

## Project Structure
```
NEPSE_Stock_Predictor/
├── src/
│   ├── data_collection.py
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── train_model.py
│   ├── predict.py
│   └── utils.py
├── app/
│   └── streamlit_app.py
├── notebooks/
│   ├── 01_eda.ipynb
│   └── 02_model_training.ipynb
├── models/                # saved .pkl / .h5 files
├── data/                  # raw + processed CSVs
├── reports/
│   ├── project_report.docx
│   └── presentation.pptx
├── requirements.txt
└── README.md
```

## Setup
```bash
pip install -r requirements.txt
```

## Usage

### 1. Collect data
```bash
python src/data_collection.py --symbol NABIL --days 1000
```

### 2. Train models
```bash
python src/train_model.py --symbol NABIL
```

### 3. Launch dashboard
```bash
streamlit run app/streamlit_app.py
```

### 4. Predict
```bash
python src/predict.py --symbol NABIL --horizon 30 --model xgboost
```

## Notes
- The `nepse-scraper` package fetches live NEPSE data. If unavailable, the system falls back to synthetic OHLCV data so the pipeline still runs end-to-end.
- LSTM training requires TensorFlow; CPU is fine for the small NEPSE datasets.

## License
MIT

"""Shared utility helpers."""
import os
import logging

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT, "data")
MODELS_DIR = os.path.join(ROOT, "models")
REPORTS_DIR = os.path.join(ROOT, "reports")

for d in (DATA_DIR, MODELS_DIR, REPORTS_DIR):
    os.makedirs(d, exist_ok=True)

NEPSE_COMPANIES = [
    "NABIL",   # Nabil Bank
    "NICA",    # NIC Asia Bank
    "NRIC",    # Nepal Reinsurance Company
    "CIT",     # Citizen Investment Trust
    "SHIVM",   # Shivam Cements
    "HIDCL",   # Hydroelectricity Investment & Development Co.
]

def get_logger(name: str) -> logging.Logger:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    return logging.getLogger(name)

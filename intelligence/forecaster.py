"""
Green-Ledger Intelligence Service — Solar Forecaster
Wraps TimesFM 2.5 (google/timesfm-2.5-200m-transformers)
for solar generation prediction.
"""

import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ─── Model Loading ───

_model = None
_tokenizer = None


def _load_model():
    """Lazy-load TimesFM 2.5 model. Falls back to mock if unavailable."""
    global _model, _tokenizer
    if _model is not None:
        return True

    try:
        from transformers import (
            TimesFm2_5ModelForPrediction,
            TimesFm2_5Tokenizer,
        )

        logger.info("Loading TimesFM 2.5 model...")
        _tokenizer = TimesFm2_5Tokenizer.from_pretrained(
            "google/timesfm-2.5-200m-transformers"
        )
        _model = TimesFm2_5ModelForPrediction.from_pretrained(
            "google/timesfm-2.5-200m-transformers"
        )
        logger.info("TimesFM 2.5 model loaded successfully.")
        return True
    except Exception as e:
        logger.warning(f"Could not load TimesFM 2.5 model: {e}")
        logger.warning("Falling back to mock forecaster.")
        return False


# ─── Mock Forecaster (Fallback) ───


def _mock_forecast(history: list[float], horizon: int = 6) -> dict:
    """Simple mock forecast using solar curve + noise."""
    last_val = history[-1] if history else 2.0
    predictions = []
    for i in range(horizon):
        # Decay pattern with slight randomness
        val = max(0, last_val * (0.9 - i * 0.05) + np.random.normal(0, 0.2))
        predictions.append(round(val, 3))

    return {
        "mean_predictions": predictions,
        "quantiles_p10": [round(max(0, p * 0.7), 3) for p in predictions],
        "quantiles_p90": [round(p * 1.3, 3) for p in predictions],
        "horizon_hours": horizon,
        "model": "mock",
    }


# ─── Real Forecaster ───


def forecast_solar(
    history: list[float],
    horizon: int = 6,
    freq: str = "H",
) -> dict:
    """
    Forecast solar generation using TimesFM 2.5.

    Args:
        history: Array of kWh readings (hourly)
        horizon: Number of hours to forecast
        freq: Frequency string (H=hourly)

    Returns:
        dict with mean_predictions, quantiles, and horizon
    """
    if not _load_model():
        return _mock_forecast(history, horizon)

    try:
        import torch

        # Prepare input tensor
        input_tensor = torch.tensor([history], dtype=torch.float32)

        # Tokenize
        tokenized = _tokenizer(
            {"input_values": input_tensor},
            freq=freq,
            prediction_length=horizon,
            return_tensors="pt",
        )

        # Predict
        with torch.no_grad():
            output = _model(**tokenized)

        mean_preds = output.mean_predictions[0].tolist()
        full_preds = output.full_predictions[0]  # quantiles

        # Truncate negatives (solar can't be negative)
        mean_preds = [round(max(0, v), 3) for v in mean_preds]

        # Extract P10 and P90 quantiles
        quantiles_p10 = [round(max(0, v), 3) for v in full_preds[1].tolist()]
        quantiles_p90 = [round(max(0, v), 3) for v in full_preds[-2].tolist()]

        return {
            "mean_predictions": mean_preds,
            "quantiles_p10": quantiles_p10,
            "quantiles_p90": quantiles_p90,
            "horizon_hours": horizon,
            "model": "timesfm-2.5",
        }

    except Exception as e:
        logger.error(f"TimesFM prediction failed: {e}")
        return _mock_forecast(history, horizon)

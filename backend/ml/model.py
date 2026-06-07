"""
Behavioral Biometrics ML Model
Using Isolation Forest for anomaly detection (unsupervised)

Why Isolation Forest?
- Perfect for small, unlabeled datasets (no need to label "attacker" vs "real user")
- Used in production security systems
- Referenced in all 5 literature survey papers
- Handles keystroke dynamics well
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from dataclasses import dataclass, field
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class BehavioralSample:
    avg_dwell_time: float       # avg ms key held down
    avg_flight_time: float      # avg ms between keystrokes
    typing_speed: float         # chars per second
    total_duration: float       # total typing duration ms
    keystroke_count: int        # number of keystrokes
    login_hour: int             # 0-23
    login_day_of_week: int      # 0-6 (Mon-Sun)


def extract_features(sample: BehavioralSample) -> np.ndarray:
    """Convert behavioral sample to feature vector for ML model."""
    return np.array([
        sample.avg_dwell_time,
        sample.avg_flight_time,
        sample.typing_speed,
        sample.total_duration / 1000,   # normalize to seconds
        sample.keystroke_count,
        sample.login_hour,
        sample.login_day_of_week,
        sample.avg_dwell_time / max(sample.avg_flight_time, 1),   # dwell/flight ratio
    ])


class UserBehaviorModel:
    """
    Per-user Isolation Forest model.
    Trained incrementally as user logs in more times.
    """

    MIN_SAMPLES_FOR_ML = 5      # Need at least 5 logins before ML kicks in
    RETRAIN_INTERVAL = 3        # Retrain every N new logins

    def __init__(self, clerk_user_id: str):
        self.clerk_user_id = clerk_user_id
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        self.training_data: List[np.ndarray] = []
        self.login_count = 0
        self.is_trained = False

    def add_sample(self, sample: BehavioralSample):
        """Add a new behavioral sample to training data."""
        features = extract_features(sample)
        self.training_data.append(features)
        self.login_count += 1

        # Retrain model when we have enough data
        if len(self.training_data) >= self.MIN_SAMPLES_FOR_ML:
            if self.login_count % self.RETRAIN_INTERVAL == 0 or not self.is_trained:
                self._train()

    def _train(self):
        """Train/retrain Isolation Forest on accumulated data."""
        if len(self.training_data) < self.MIN_SAMPLES_FOR_ML:
            return

        X = np.array(self.training_data)

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Isolation Forest: contamination = expected % of anomalies
        # Low contamination since most of user's own logins should be normal
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,     # expect 5% anomalies in training data
            random_state=42,
            max_features=1.0,
        )
        self.model.fit(X_scaled)
        self.is_trained = True
        logger.info(f"Model trained for user {self.clerk_user_id} on {len(self.training_data)} samples")

    def predict(self, sample: BehavioralSample) -> dict:
        """
        Predict if a login is anomalous.
        Returns: { is_anomaly: bool, anomaly_score: float (0-1), confidence: float }
        """
        features = extract_features(sample)

        if not self.is_trained or self.model is None:
            # Phase 1: No model yet, return neutral score
            return {
                "is_anomaly": False,
                "anomaly_score": 0.0,
                "confidence": 0.0,
                "phase": "rule_based",
            }

        X = self.scaler.transform(features.reshape(1, -1))
        
        # decision_function returns negative = anomaly, positive = normal
        decision = self.model.decision_function(X)[0]
        prediction = self.model.predict(X)[0]  # -1 = anomaly, 1 = normal

        # Normalize to 0-1 score (higher = more anomalous)
        # decision_function typically ranges -0.5 to 0.5
        anomaly_score = max(0, min(1, (-decision + 0.3) / 0.6))

        return {
            "is_anomaly": prediction == -1,
            "anomaly_score": float(anomaly_score),
            "confidence": float(len(self.training_data) / 20),  # increases with more data
            "phase": "ml_model",
        }

    def to_dict(self) -> dict:
        """Serialize for storage in MongoDB."""
        data = {
            "clerk_user_id": self.clerk_user_id,
            "login_count": self.login_count,
            "is_trained": self.is_trained,
            "training_data": [x.tolist() for x in self.training_data],
        }
        if self.model and self.scaler:
            data["model_bytes"] = pickle.dumps(self.model).hex()
            data["scaler_bytes"] = pickle.dumps(self.scaler).hex()
        return data

    @classmethod
    def from_dict(cls, data: dict) -> "UserBehaviorModel":
        """Deserialize from MongoDB."""
        model = cls(data["clerk_user_id"])
        model.login_count = data.get("login_count", 0)
        model.is_trained = data.get("is_trained", False)
        model.training_data = [np.array(x) for x in data.get("training_data", [])]

        if "model_bytes" in data and data["model_bytes"]:
            model.model = pickle.loads(bytes.fromhex(data["model_bytes"]))
            model.scaler = pickle.loads(bytes.fromhex(data["scaler_bytes"]))

        return model


# In-memory model cache (so we don't reload from DB every request)
_model_cache: dict[str, UserBehaviorModel] = {}


def get_user_model(clerk_user_id: str) -> UserBehaviorModel:
    if clerk_user_id not in _model_cache:
        _model_cache[clerk_user_id] = UserBehaviorModel(clerk_user_id)
    return _model_cache[clerk_user_id]


def update_model_cache(clerk_user_id: str, model: UserBehaviorModel):
    _model_cache[clerk_user_id] = model

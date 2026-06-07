"""
Behavior Analysis Routes
POST /behavior/analyze   — analyze login behavioral data, return risk score
POST /behavior/confirm-mfa — confirm MFA passed, finalize session
GET  /behavior/baseline/{user_id} — get user's behavioral baseline
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional

from db.mongodb import get_db
from ml.model import (
    BehavioralSample,
    UserBehaviorModel,
    get_user_model,
    update_model_cache,
)
from ml.risk_score import (
    LoginContext,
    calculate_risk_score,
    should_require_mfa,
)

router = APIRouter(prefix="/behavior", tags=["behavior"])


class BehavioralPayload(BaseModel):
    clerk_user_id: str
    email: str
    avg_dwell_time: float = Field(ge=0)
    avg_flight_time: float = Field(ge=0)
    typing_speed: float = Field(ge=0)
    total_duration: float = Field(ge=0)
    keystroke_count: int = Field(ge=0)
    ip_address: Optional[str] = ""
    user_agent: Optional[str] = ""
    timezone: Optional[str] = ""
    login_hour: int = Field(ge=0, le=23)
    login_day_of_week: int = Field(ge=0, le=6)


class RiskResponse(BaseModel):
    risk_score: int
    risk_level: str
    anomaly_factors: List[str]
    require_mfa: bool
    session_id: str


@router.post("/analyze", response_model=RiskResponse)
async def analyze_behavior(payload: BehavioralPayload):
    db = get_db()

    # 1. Load user's historical profile from DB
    profile_doc = await db.behavioral_profiles.find_one(
        {"clerk_user_id": payload.clerk_user_id}
    )

    # 2. Load or create ML model
    if profile_doc:
        user_model = UserBehaviorModel.from_dict(profile_doc)
        update_model_cache(payload.clerk_user_id, user_model)
    else:
        user_model = get_user_model(payload.clerk_user_id)

    # 3. Get historical context (known IPs, devices, timezones)
    past_sessions = await db.sessions.find(
        {"clerk_user_id": payload.clerk_user_id}
    ).limit(50).to_list(50)

    known_ips = list({s.get("ip_address") for s in past_sessions if s.get("ip_address")})
    known_uas = list({s.get("user_agent", "")[:100] for s in past_sessions if s.get("user_agent")})
    known_tzs = list({s.get("timezone") for s in past_sessions if s.get("timezone")})

    # 4. Run ML prediction on current behavior
    sample = BehavioralSample(
        avg_dwell_time=payload.avg_dwell_time,
        avg_flight_time=payload.avg_flight_time,
        typing_speed=payload.typing_speed,
        total_duration=payload.total_duration,
        keystroke_count=payload.keystroke_count,
        login_hour=payload.login_hour,
        login_day_of_week=payload.login_day_of_week,
    )
    ml_result = user_model.predict(sample)

    # 5. Calculate risk score (rule-based + ML hybrid)
    ctx = LoginContext(
        clerk_user_id=payload.clerk_user_id,
        email=payload.email,
        avg_dwell_time=payload.avg_dwell_time,
        avg_flight_time=payload.avg_flight_time,
        typing_speed=payload.typing_speed,
        total_duration=payload.total_duration,
        keystroke_count=payload.keystroke_count,
        ip_address=payload.ip_address or "",
        user_agent=payload.user_agent or "",
        timezone=payload.timezone or "",
        login_hour=payload.login_hour,
        login_day_of_week=payload.login_day_of_week,
        known_ips=known_ips,
        known_user_agents=known_uas,
        known_timezones=known_tzs,
        total_logins=len(past_sessions),
    )

    risk_score, risk_level, anomaly_factors = calculate_risk_score(ctx, ml_result)
    require_mfa = should_require_mfa(risk_score, risk_level)

    # 6. Generate session ID
    session_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc)

    # 7. Store session in DB
    await db.sessions.insert_one({
        "session_id": session_id,
        "clerk_user_id": payload.clerk_user_id,
        "email": payload.email,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "anomaly_factors": anomaly_factors,
        "mfa_required": require_mfa,
        "mfa_passed": False,
        "ip_address": payload.ip_address,
        "user_agent": payload.user_agent,
        "timezone": payload.timezone,
        "login_hour": payload.login_hour,
        "login_day_of_week": payload.login_day_of_week,
        "avg_dwell_time": payload.avg_dwell_time,
        "avg_flight_time": payload.avg_flight_time,
        "typing_speed": payload.typing_speed,
        "keystroke_count": payload.keystroke_count,
        "timestamp": timestamp,
        "status": "flagged" if require_mfa else "safe",
    })

    # 8. Create alert if high risk
    if risk_level == "high":
        await db.alerts.insert_one({
            "clerk_user_id": payload.clerk_user_id,
            "session_id": session_id,
            "type": "high_risk_login",
            "title": "High Risk Login Detected",
            "description": f"Risk score {risk_score}/100. MFA triggered.",
            "factors": anomaly_factors,
            "resolved": False,
            "timestamp": timestamp,
        })

    # 9. Update behavioral profile (add sample for future ML training)
    if risk_level == "low":   # only train on verified-safe sessions
        user_model.add_sample(sample)
        model_dict = user_model.to_dict()
        await db.behavioral_profiles.update_one(
            {"clerk_user_id": payload.clerk_user_id},
            {"$set": {**model_dict, "updated_at": timestamp}},
            upsert=True,
        )
        update_model_cache(payload.clerk_user_id, user_model)

    return RiskResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        anomaly_factors=anomaly_factors,
        require_mfa=require_mfa,
        session_id=session_id,
    )


@router.post("/confirm-mfa")
async def confirm_mfa(data: dict):
    """Called after user passes MFA — mark session as verified."""
    db = get_db()
    session_id = data.get("session_id")
    clerk_user_id = data.get("clerk_user_id")

    if not session_id:
        raise HTTPException(400, "session_id required")

    await db.sessions.update_one(
        {"session_id": session_id, "clerk_user_id": clerk_user_id},
        {"$set": {"mfa_passed": True, "status": "mfa_verified"}},
    )
    return {"success": True}


@router.get("/baseline/{clerk_user_id}")
async def get_baseline(clerk_user_id: str):
    """Get user's behavioral baseline for the frontend profile page."""
    db = get_db()
    profile = await db.behavioral_profiles.find_one({"clerk_user_id": clerk_user_id})

    if not profile:
        return {"message": "No baseline yet", "login_count": 0, "is_trained": False}

    training_data = profile.get("training_data", [])
    if not training_data:
        return {"login_count": profile.get("login_count", 0), "is_trained": False}

    import numpy as np
    arr = np.array(training_data)

    return {
        "login_count": profile.get("login_count", 0),
        "is_trained": profile.get("is_trained", False),
        "avg_dwell_time": float(arr[:, 0].mean()) if len(arr) > 0 else 0,
        "avg_flight_time": float(arr[:, 1].mean()) if len(arr) > 0 else 0,
        "avg_typing_speed": float(arr[:, 2].mean()) if len(arr) > 0 else 0,
        "samples": len(training_data),
    }

"""
User Routes
GET /user/sessions/{clerk_user_id}        — user's own session history
GET /user/alerts/{clerk_user_id}          — user's security alerts
GET /user/behavior-profile/{clerk_user_id} — behavioral data for profile page
"""

from fastapi import APIRouter, Query
from db.mongodb import get_db

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/sessions/{clerk_user_id}")
async def get_user_sessions(
    clerk_user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    db = get_db()
    skip = (page - 1) * limit

    sessions = await db.sessions.find(
        {"clerk_user_id": clerk_user_id}
    ).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)

    total = await db.sessions.count_documents({"clerk_user_id": clerk_user_id})

    for s in sessions:
        s["_id"] = str(s["_id"])
        if s.get("timestamp"):
            s["timestamp"] = s["timestamp"].isoformat()

    return {"sessions": sessions, "total": total}


@router.get("/alerts/{clerk_user_id}")
async def get_user_alerts(clerk_user_id: str):
    db = get_db()

    alerts = await db.alerts.find(
        {"clerk_user_id": clerk_user_id}
    ).sort("timestamp", -1).limit(20).to_list(20)

    for a in alerts:
        a["_id"] = str(a["_id"])
        if a.get("timestamp"):
            a["timestamp"] = a["timestamp"].isoformat()

    return alerts


@router.get("/behavior-profile/{clerk_user_id}")
async def get_behavior_profile(clerk_user_id: str):
    db = get_db()

    # Get last 30 sessions for chart data
    sessions = await db.sessions.find(
        {"clerk_user_id": clerk_user_id}
    ).sort("timestamp", -1).limit(30).to_list(30)

    if not sessions:
        return {"has_data": False}

    profile = await db.behavioral_profiles.find_one({"clerk_user_id": clerk_user_id})

    # Build chart-ready data
    risk_history = [
        {
            "date": s["timestamp"].isoformat() if s.get("timestamp") else "",
            "risk_score": s.get("risk_score", 0),
            "typing_speed": round(s.get("typing_speed", 0), 2),
            "avg_dwell_time": round(s.get("avg_dwell_time", 0), 2),
        }
        for s in reversed(sessions)
    ]

    import numpy as np
    dwell_times = [s.get("avg_dwell_time", 0) for s in sessions if s.get("avg_dwell_time")]
    flight_times = [s.get("avg_flight_time", 0) for s in sessions if s.get("avg_flight_time")]
    speeds = [s.get("typing_speed", 0) for s in sessions if s.get("typing_speed")]

    return {
        "has_data": True,
        "total_sessions": len(sessions),
        "avg_dwell_time": round(float(np.mean(dwell_times)), 2) if dwell_times else 0,
        "avg_flight_time": round(float(np.mean(flight_times)), 2) if flight_times else 0,
        "avg_typing_speed": round(float(np.mean(speeds)), 3) if speeds else 0,
        "risk_history": risk_history,
        "ml_trained": profile.get("is_trained", False) if profile else False,
        "login_count": profile.get("login_count", len(sessions)) if profile else len(sessions),
    }

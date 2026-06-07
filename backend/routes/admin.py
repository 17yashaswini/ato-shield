"""
Admin Routes
GET  /admin/stats         — dashboard KPIs
GET  /admin/users         — all users with risk data
GET  /admin/sessions      — all sessions (paginated)
GET  /admin/threats       — high/medium risk events
POST /admin/users/block   — block a user
GET  /admin/export/csv    — export session logs as CSV
"""

import csv
import io
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from db.mongodb import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

# NOTE: In production, protect all admin routes with Clerk JWT + admin role check.
# For local dev, these are open for demonstration purposes.


@router.get("/stats")
async def get_stats():
    db = get_db()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = await db.behavioral_profiles.count_documents({})
    total_sessions = await db.sessions.count_documents({})
    sessions_today = await db.sessions.count_documents({"timestamp": {"$gte": today_start}})
    threats_today = await db.sessions.count_documents({
        "timestamp": {"$gte": today_start},
        "risk_level": {"$in": ["medium", "high"]},
    })
    high_risk_today = await db.sessions.count_documents({
        "timestamp": {"$gte": today_start},
        "risk_level": "high",
    })
    mfa_users = await db.behavioral_profiles.count_documents({"is_trained": True})
    active_sessions = await db.sessions.count_documents({
        "timestamp": {"$gte": now - timedelta(hours=1)},
    })

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "sessions_today": sessions_today,
        "threats_today": threats_today,
        "high_risk_today": high_risk_today,
        "mfa_users": mfa_users,
        "active_sessions": active_sessions,
    }


@router.get("/users")
async def get_all_users():
    db = get_db()

    # Aggregate sessions per user for risk summary
    pipeline = [
        {
            "$group": {
                "_id": "$clerk_user_id",
                "email": {"$last": "$email"},
                "total_sessions": {"$sum": 1},
                "avg_risk_score": {"$avg": "$risk_score"},
                "max_risk_score": {"$max": "$risk_score"},
                "last_login": {"$max": "$timestamp"},
                "flagged_count": {
                    "$sum": {"$cond": [{"$in": ["$risk_level", ["medium", "high"]]}, 1, 0]}
                },
                "high_risk_count": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "high"]}, 1, 0]}
                },
            }
        },
        {"$sort": {"max_risk_score": -1}},
        {"$limit": 100},
    ]

    users = await db.sessions.aggregate(pipeline).to_list(100)

    # Get ML training status
    profiles = {
        p["clerk_user_id"]: p
        async for p in db.behavioral_profiles.find({}, {"clerk_user_id": 1, "is_trained": 1, "login_count": 1})
    }

    result = []
    for u in users:
        profile = profiles.get(u["_id"], {})
        result.append({
            "clerk_user_id": u["_id"],
            "email": u.get("email", "unknown"),
            "total_sessions": u["total_sessions"],
            "avg_risk_score": round(u["avg_risk_score"], 1),
            "max_risk_score": u["max_risk_score"],
            "flagged_count": u["flagged_count"],
            "high_risk_count": u["high_risk_count"],
            "last_login": u["last_login"].isoformat() if u.get("last_login") else None,
            "ml_trained": profile.get("is_trained", False),
            "login_count": profile.get("login_count", u["total_sessions"]),
            "status": "active",  # TODO: fetch from blocked_users collection
        })

    return result


@router.get("/sessions")
async def get_sessions(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    risk_level: str = Query(None),
    user_id: str = Query(None),
):
    db = get_db()
    query = {}
    if risk_level:
        query["risk_level"] = risk_level
    if user_id:
        query["clerk_user_id"] = user_id

    skip = (page - 1) * limit
    sessions = await db.sessions.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.sessions.count_documents(query)

    for s in sessions:
        s["_id"] = str(s["_id"])
        if s.get("timestamp"):
            s["timestamp"] = s["timestamp"].isoformat()

    return {"sessions": sessions, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.get("/threats")
async def get_threats(limit: int = Query(50, ge=1, le=200)):
    db = get_db()

    threats = await db.sessions.find(
        {"risk_level": {"$in": ["medium", "high"]}}
    ).sort("timestamp", -1).limit(limit).to_list(limit)

    for t in threats:
        t["_id"] = str(t["_id"])
        if t.get("timestamp"):
            t["timestamp"] = t["timestamp"].isoformat()

    return threats


class BlockUserRequest(BaseModel):
    user_id: str
    reason: str


@router.post("/users/block")
async def block_user(req: BlockUserRequest):
    db = get_db()
    await db.blocked_users.update_one(
        {"clerk_user_id": req.user_id},
        {"$set": {
            "clerk_user_id": req.user_id,
            "reason": req.reason,
            "blocked_at": datetime.now(timezone.utc),
            "active": True,
        }},
        upsert=True,
    )

    # Create admin alert
    await db.alerts.insert_one({
        "type": "admin_action",
        "title": f"User blocked by admin",
        "description": f"Reason: {req.reason}",
        "clerk_user_id": req.user_id,
        "resolved": True,
        "timestamp": datetime.now(timezone.utc),
    })

    return {"success": True, "message": f"User {req.user_id} blocked"}


@router.post("/users/unblock")
async def unblock_user(data: dict):
    db = get_db()
    user_id = data.get("user_id")
    await db.blocked_users.update_one(
        {"clerk_user_id": user_id},
        {"$set": {"active": False}},
    )
    return {"success": True}


@router.get("/export/csv")
async def export_csv():
    db = get_db()
    sessions = await db.sessions.find({}).sort("timestamp", -1).limit(5000).to_list(5000)

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "session_id", "email", "timestamp", "risk_score", "risk_level",
        "ip_address", "timezone", "login_hour", "typing_speed",
        "avg_dwell_time", "avg_flight_time", "keystroke_count",
        "mfa_required", "mfa_passed", "status", "anomaly_factors",
    ])
    writer.writeheader()

    for s in sessions:
        writer.writerow({
            "session_id": s.get("session_id", ""),
            "email": s.get("email", ""),
            "timestamp": s.get("timestamp", ""),
            "risk_score": s.get("risk_score", ""),
            "risk_level": s.get("risk_level", ""),
            "ip_address": s.get("ip_address", ""),
            "timezone": s.get("timezone", ""),
            "login_hour": s.get("login_hour", ""),
            "typing_speed": round(s.get("typing_speed", 0), 3),
            "avg_dwell_time": round(s.get("avg_dwell_time", 0), 2),
            "avg_flight_time": round(s.get("avg_flight_time", 0), 2),
            "keystroke_count": s.get("keystroke_count", ""),
            "mfa_required": s.get("mfa_required", ""),
            "mfa_passed": s.get("mfa_passed", ""),
            "status": s.get("status", ""),
            "anomaly_factors": "; ".join(s.get("anomaly_factors", [])),
        })

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ato_shield_sessions.csv"},
    )

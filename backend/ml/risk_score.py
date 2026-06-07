"""
Risk Score Engine
Hybrid: Rule-based checks + ML anomaly detection

Rule-based catches obvious threats immediately.
ML catches subtle behavioral deviations over time.
"""

from dataclasses import dataclass
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)


@dataclass
class LoginContext:
    clerk_user_id: str
    email: str
    avg_dwell_time: float
    avg_flight_time: float
    typing_speed: float
    total_duration: float
    keystroke_count: int
    ip_address: str = ""
    user_agent: str = ""
    timezone: str = ""
    login_hour: int = 12
    login_day_of_week: int = 0
    # Historical context (fetched from DB)
    known_ips: List[str] = None
    known_user_agents: List[str] = None
    known_timezones: List[str] = None
    total_logins: int = 0


def rule_based_checks(ctx: LoginContext) -> Tuple[int, List[str]]:
    """
    Apply deterministic rules. Returns (score_penalty, anomaly_factors).
    These fire immediately even for new users.
    """
    penalty = 0
    factors = []

    # New IP address
    if ctx.known_ips and ctx.ip_address and ctx.ip_address not in ctx.known_ips:
        penalty += 20
        factors.append(f"Login from new IP: {ctx.ip_address}")

    # New device / browser
    if ctx.known_user_agents and ctx.user_agent:
        ua_match = any(ctx.user_agent[:50] in ua for ua in ctx.known_user_agents)
        if not ua_match:
            penalty += 20
            factors.append("Login from new device or browser")

    # New timezone (geo anomaly)
    if ctx.known_timezones and ctx.timezone and ctx.timezone not in ctx.known_timezones:
        penalty += 25
        factors.append(f"Login from new timezone: {ctx.timezone}")

    # Unusual login hour (outside 7 AM - 11 PM)
    if ctx.login_hour < 7 or ctx.login_hour > 23:
        penalty += 15
        factors.append(f"Login at unusual hour: {ctx.login_hour}:00")

    # Very fast or very slow typing (potential bot / different person)
    if ctx.typing_speed > 0:
        if ctx.typing_speed < 0.5:  # less than 0.5 chars/sec = very slow
            penalty += 10
            factors.append("Unusually slow typing speed")
        elif ctx.typing_speed > 15:  # > 15 chars/sec = suspiciously fast
            penalty += 25
            factors.append("Suspiciously fast typing — possible automation")

    # Very few keystrokes (tab-fill / paste)
    if ctx.keystroke_count < 5 and ctx.total_duration > 0:
        penalty += 15
        factors.append("Password may have been pasted (very few keystrokes)")

    return min(penalty, 70), factors  # cap rule-based at 70


def calculate_risk_score(
    ctx: LoginContext,
    ml_result: dict,
) -> Tuple[int, str, List[str]]:
    """
    Combine rule-based and ML scores into final risk score.
    
    Returns: (score 0-100, level 'low'|'medium'|'high', factors list)
    """
    # Rule-based score
    rule_score, rule_factors = rule_based_checks(ctx)

    # ML score (0-1 scale → 0-50 points)
    ml_score = 0
    ml_factors = []
    if ml_result.get("phase") == "ml_model":
        ml_anomaly = ml_result.get("anomaly_score", 0)
        ml_score = int(ml_anomaly * 50)
        if ml_result.get("is_anomaly"):
            confidence = ml_result.get("confidence", 0)
            ml_factors.append(
                f"ML model detected behavioral anomaly "
                f"(confidence: {int(confidence * 100)}%)"
            )

    # Weighted combination
    # Rule-based: max 70 points, ML: max 50 points, capped at 100
    total_score = min(100, int(rule_score * 0.6 + ml_score * 0.4 + rule_score * 0.1))
    
    # First-time user gets reduced penalty (no baseline)
    if ctx.total_logins <= 1:
        total_score = min(total_score, 30)
    
    # Risk level
    if total_score < 30:
        level = "low"
    elif total_score < 70:
        level = "medium"
    else:
        level = "high"

    all_factors = rule_factors + ml_factors

    logger.info(
        f"Risk score for {ctx.email}: {total_score} ({level}) | "
        f"rule={rule_score}, ml={ml_score} | factors={len(all_factors)}"
    )

    return total_score, level, all_factors


def should_require_mfa(score: int, level: str) -> bool:
    """MFA required for medium and high risk."""
    return level in ("medium", "high")

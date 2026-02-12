import os
import json
import urllib3
from urllib.parse import urlencode
from fastapi import APIRouter, HTTPException, Depends
from backend.utils.auth_utils import get_current_user

router = APIRouter(prefix="/health", tags=["Health ML"])

ML_BASE_URL = os.getenv("ML_BASE_URL", "http://wellness-ml-flask.onrender.com").rstrip("/")
http = urllib3.PoolManager()


def _first_value(data: dict, keys: list[str], default=None):
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return default


def _normalize_ml_response(path: str, data: dict):
    # Keep original payload and backfill keys expected by frontend.
    normalized = dict(data or {})

    if path == "/bmi":
        normalized["bmi"] = _first_value(normalized, ["bmi", "bmi_value", "body_mass_index"])
        normalized["category"] = _first_value(normalized, ["category", "bmi_category"])

    elif path == "/calorie":
        normalized["daily_calories"] = _first_value(
            normalized, ["daily_calories", "calories", "body_calories"]
        )

    elif path == "/water":
        normalized["water_intake_liters"] = _first_value(
            normalized, ["water_intake_liters", "water_needed_l", "water_needed"]
        )

    elif path == "/ideal_weight":
        normalized["ideal_weight_kg"] = _first_value(
            normalized, ["ideal_weight_kg", "ideal_weight", "ideal"]
        )

    elif path == "/sleep":
        normalized["recommended_sleep_hours"] = _first_value(
            normalized, ["recommended_sleep_hours", "sleep_hours", "hours"]
        )

    elif path == "/recovery":
        normalized["recovery_status"] = _first_value(
            normalized, ["recovery_status", "status", "fatigue"]
        )
        normalized["recommendation"] = _first_value(normalized, ["recommendation", "advice"])

    elif path == "/match_fitness":
        normalized["match_fitness_score"] = _first_value(
            normalized, ["match_fitness_score", "score", "fitness_score"]
        )
        normalized["fitness_level"] = _first_value(
            normalized, ["fitness_level", "readiness", "status", "fitness"]
        )
        if normalized.get("match_fitness_score") is None:
            readiness = str(_first_value(normalized, ["readiness", "status", "fitness_level"], "")).lower()
            if "high" in readiness or "ready" in readiness:
                normalized["match_fitness_score"] = 85
            elif "moderate" in readiness or "partial" in readiness:
                normalized["match_fitness_score"] = 60
            elif readiness:
                normalized["match_fitness_score"] = 35

    elif path == "/training_load":
        normalized["training_load"] = _first_value(
            normalized, ["training_load", "fatigue", "load", "status"]
        )
        normalized["recommendation"] = _first_value(normalized, ["recommendation", "advice"])

    elif path == "/diet":
        macros = normalized.get("macros") or {}
        if isinstance(macros, dict):
            macros["protein"] = _first_value(macros, ["protein", "protein_g"])
            macros["carbs"] = _first_value(macros, ["carbs", "carbs_g"])
            macros["fats"] = _first_value(macros, ["fats", "fat", "fats_g"])
            normalized["macros"] = macros

    elif path == "/predict_image_json":
        normalized["predicted_class"] = _first_value(
            normalized, ["predicted_class", "food", "class", "prediction"]
        )
        normalized["confidence"] = _first_value(
            normalized, ["confidence", "probability", "score"]
        )

    return normalized


def _normalize_ml_payload(path: str, payload: dict):
    normalized = dict(payload or {})

    if path == "/sleep":
        # Her model expects: age, hours
        if "hours" not in normalized:
            intensity = str(normalized.get("training_intensity", "moderate")).lower()
            normalized["hours"] = {"low": 8.0, "moderate": 7.5, "high": 7.0}.get(intensity, 7.5)

    elif path == "/recovery":
        # Her model expects: training_hours, sleep_hours, soreness
        if "training_hours" not in normalized:
            intensity = str(normalized.get("training_intensity", "moderate")).lower()
            normalized["training_hours"] = {"low": 1.5, "moderate": 2.5, "high": 3.5}.get(intensity, 2.5)
        if "soreness" not in normalized:
            soreness = str(normalized.get("muscle_soreness", "moderate")).lower()
            normalized["soreness"] = "yes" if soreness in ["moderate", "high", "yes", "true"] else "no"

    elif path == "/match_fitness":
        # Her model expects: sleep_hours, training, soreness
        if "sleep_hours" not in normalized:
            fatigue = str(normalized.get("fatigue_level", "moderate")).lower()
            normalized["sleep_hours"] = {"low": 8.0, "moderate": 7.0, "high": 5.5}.get(fatigue, 7.0)
        if "training" not in normalized:
            distance = float(normalized.get("distance_km", 0) or 0)
            sprints = int(normalized.get("sprints", 0) or 0)
            if distance >= 10 or sprints >= 25:
                normalized["training"] = "heavy"
            elif distance >= 6 or sprints >= 15:
                normalized["training"] = "moderate"
            else:
                normalized["training"] = "light"
        if "soreness" not in normalized:
            fatigue = str(normalized.get("fatigue_level", "moderate")).lower()
            normalized["soreness"] = "yes" if fatigue in ["moderate", "high"] else "no"

    elif path == "/training_load":
        # Her model expects: intensity, duration_min, sleep_hours
        if "duration_min" not in normalized and "session_duration_min" in normalized:
            normalized["duration_min"] = normalized["session_duration_min"]
        intensity = str(normalized.get("intensity", "moderate")).lower()
        if intensity == "moderate":
            normalized["intensity"] = "medium"
        if "sleep_hours" not in normalized:
            try:
                rpe = float(normalized.get("rpe", 6) or 6)
                normalized["sleep_hours"] = max(4.0, min(9.0, round(9.0 - (rpe * 0.5), 1)))
            except Exception:
                normalized["sleep_hours"] = 7.0

    elif path == "/diet":
        # Goal vocabulary mapping.
        goal = str(normalized.get("goal", "")).strip().lower()
        goal_map = {
            "lose": "loss",
            "fat loss": "loss",
            "weight loss": "loss",
            "gain": "gain",
            "muscle gain": "gain",
            "maintain": "maintain",
        }
        if goal in goal_map:
            normalized["goal"] = goal_map[goal]

        # Day-type vocabulary mapping.
        day = str(normalized.get("day", "")).strip().lower()
        day_map = {
            "match day": "match",
            "training day": "training",
            "rest day": "rest",
            "match": "match",
            "training": "training",
            "rest": "rest",
        }
        if day in day_map:
            normalized["day"] = day_map[day]

        # Position vocabulary mapping.
        position = str(normalized.get("position", "")).strip().lower()
        position_map = {
            "goalkeeper": "gk",
            "goal keeper": "gk",
            "defender": "def",
            "midfielder": "mid",
            "forward": "fwd",
            "striker": "fwd",
        }
        if position in position_map:
            normalized["position"] = position_map[position]

    elif path == "/calorie":
        # UI may send typo/alias for quantity.
        if "quantity_g" not in normalized and "quality" in normalized:
            normalized["quantity_g"] = normalized["quality"]

    elif path == "/water":
        # Optional alias from UI labels.
        if "duration_hr" not in normalized and "duration_hours" in normalized:
            normalized["duration_hr"] = normalized["duration_hours"]

    return normalized


def _http_json(method: str, url: str, payload: dict | None = None):
    ml_headers = {
        "Content-Type": "application/json",
        "X-ML-API-Key": os.getenv("WELLNESS_ML_API_KEY", "Krish123"),
    }
    try:
        if method == "GET":
            if payload:
                url = f"{url}?{urlencode(payload)}"
            resp = http.request("GET", url, headers=ml_headers, timeout=10.0, retries=False)
        else:
            resp = http.request(
                "POST",
                url,
                body=json.dumps(payload or {}).encode("utf-8"),
                headers=ml_headers,
                timeout=10.0,
                retries=False,
            )
    except Exception as exc:
        return None, 502, f"ML server error: {exc}"

    body_text = resp.data.decode("utf-8", errors="ignore") if resp.data else ""
    if resp.status >= 400:
        return None, resp.status, body_text

    try:
        return json.loads(body_text), resp.status, body_text
    except Exception:
        return None, resp.status, body_text


def _to_query_payload(path: str, payload: dict):
    mapped = dict(payload or {})
    # Common field aliases for Flask query-based endpoints.
    if "height_cm" in mapped and "height" not in mapped:
        mapped["height"] = mapped["height_cm"]
    if "weight_kg" in mapped and "weight" not in mapped:
        mapped["weight"] = mapped["weight_kg"]
    if "training_intensity" in mapped and "intensity" not in mapped:
        mapped["intensity"] = mapped["training_intensity"]
    if "session_duration_min" in mapped and "duration" not in mapped:
        mapped["duration"] = mapped["session_duration_min"]
    return mapped


def _path_variants(path: str):
    variants = [path]
    hyphen = path.replace("_", "-")
    if hyphen != path:
        variants.append(hyphen)
    return variants


def _call_ml(path: str, payload: dict):
    # Tries modern API contract first, then legacy Flask UI routes.
    mapped_payload = _normalize_ml_payload(path, payload)
    attempts = []
    for p in _path_variants(path):
        attempts.append(("POST", f"{ML_BASE_URL}/api{p}", mapped_payload))
    for p in _path_variants(path):
        attempts.append(("POST", f"{ML_BASE_URL}{p}", mapped_payload))
    for p in _path_variants(path):
        attempts.append(("GET", f"{ML_BASE_URL}{p}", _to_query_payload(path, mapped_payload)))

    last_status = 502
    last_detail = "No response from ML service"
    for method, url, data in attempts:
        parsed, status, detail = _http_json(method, url, data)
        if parsed is not None:
            if isinstance(parsed, dict):
                return _normalize_ml_response(path, parsed)
            return parsed
        last_status = status
        last_detail = detail

    raise HTTPException(status_code=502, detail=f"ML upstream error ({last_status}): {last_detail}")


@router.post("/calorie")
def calorie(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/calorie", data)


@router.post("/bmi")
def bmi(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/bmi", data)


@router.post("/water")
def water(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/water", data)


@router.post("/ideal_weight")
def ideal_weight(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/ideal_weight", data)


@router.post("/recovery")
def recovery(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/recovery", data)


@router.post("/sleep")
def sleep(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/sleep", data)


@router.post("/match_fitness")
def match_fitness(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/match_fitness", data)


@router.post("/training_load")
def training_load(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/training_load", data)


@router.post("/diet")
def diet(data: dict, current_user: dict = Depends(get_current_user)):
    # Normalize field names if provided in cm/kg
    if "height" not in data and "height_cm" in data:
        data["height"] = data["height_cm"]
    if "weight" not in data and "weight_kg" in data:
        data["weight"] = data["weight_kg"]
    return _call_ml("/diet", data)


@router.post("/predict_image_json")
def predict_image_json(data: dict, current_user: dict = Depends(get_current_user)):
    return _call_ml("/predict_image_json", data)

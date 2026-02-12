import os
import json
import urllib3
from urllib.parse import urlencode
from fastapi import APIRouter, HTTPException, Depends
from backend.utils.auth_utils import get_current_user

router = APIRouter(prefix="/health", tags=["Health ML"])

ML_BASE_URL = os.getenv("ML_BASE_URL", "http://10.134.19.52:5000").rstrip("/")
http = urllib3.PoolManager()


def _http_json(method: str, url: str, payload: dict | None = None):
    try:
        if method == "GET":
            if payload:
                url = f"{url}?{urlencode(payload)}"
            resp = http.request("GET", url, timeout=10.0, retries=False)
        else:
            resp = http.request(
                "POST",
                url,
                body=json.dumps(payload or {}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
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


def _call_ml(path: str, payload: dict):
    # Tries modern API contract first, then legacy Flask UI routes.
    attempts = [
        ("POST", f"{ML_BASE_URL}/api{path}", payload),
        ("POST", f"{ML_BASE_URL}{path}", payload),
        ("GET", f"{ML_BASE_URL}{path}", _to_query_payload(path, payload)),
    ]
    last_status = 502
    last_detail = "No response from ML service"
    for method, url, data in attempts:
        parsed, status, detail = _http_json(method, url, data)
        if parsed is not None:
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

import httpx
import logging
import math
from fastapi import APIRouter, Query
from typing import Optional
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger("bridgecare.providers")

# Public instances are often overloaded (504/429); try the next one before giving up.
OVERPASS_URLS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"]
NOMINATIM_URL = "https://nominatim.openstreetmap.org"

AMENITY_MAP = {
    "hospital": "er", "clinic": "clinic", "doctors": "clinic",
    "pharmacy": "pharmacy", "dentist": "clinic",
}


TELEHEALTH = [
    {"id": "telehealth-1", "name": "Teladoc Health", "type": "telehealth", "address": "Virtual — 24/7", "lat": None, "lon": None, "phone": "1-800-835-2362", "open_now": True, "accepts_uninsured": True, "distance_km": 0},
    {"id": "telehealth-2", "name": "MDLive", "type": "telehealth", "address": "Virtual — 24/7", "lat": None, "lon": None, "phone": None, "open_now": True, "accepts_uninsured": True, "distance_km": 0},
]


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


@router.get("/providers/search")
async def search_providers(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    q: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    address: Optional[str] = Query(None),
    radius_km: float = Query(default=5.0, le=20.0),
):
    if not lat or not lon:
        if address:
            coords = await _geocode(address)
            if coords:
                lat, lon = coords
        if not lat or not lon:
            return {"providers": TELEHEALTH, "lat": None, "lon": None, "live": False}

    providers = await _query_overpass(lat, lon, radius_km, type, q)
    return {"providers": providers, "lat": lat, "lon": lon, "live": providers is not TELEHEALTH}


@router.get("/providers/recommended/{case_id}")
async def recommended_providers(
    case_id: str,
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
):
    if not lat or not lon:
        return {"providers": TELEHEALTH}
    providers = await _query_overpass(lat, lon, radius_km=5.0)
    return {"providers": providers[:5]}


async def _geocode(address: str) -> Optional[tuple[float, float]]:
    async with httpx.AsyncClient(timeout=8.0) as client:
        r = await client.get(
            f"{NOMINATIM_URL}/search",
            params={"q": address, "format": "json", "limit": 1},
            headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
        )
        results = r.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
    return None


async def _query_overpass(
    lat: float, lon: float, radius_km: float = 5.0,
    provider_type: Optional[str] = None, query: Optional[str] = None,
) -> list[dict]:
    radius_m = int(radius_km * 1000)
    amenity = '["amenity"~"hospital|clinic|doctors|pharmacy"]' if not provider_type else {
        "pharmacy": '["amenity"="pharmacy"]',
        "er": '["amenity"="hospital"]',
        "clinic": '["amenity"~"clinic|doctors"]',
    }.get(provider_type, '["amenity"~"hospital|clinic|doctors|pharmacy"]')

    overpass_q = f'[out:json][timeout:12];(node{amenity}(around:{radius_m},{lat},{lon});way{amenity}(around:{radius_m},{lat},{lon}););out center 20;'

    data = None
    async with httpx.AsyncClient(timeout=13.0, headers={"User-Agent": settings.NOMINATIM_USER_AGENT}) as client:
        for url in OVERPASS_URLS:
            try:
                r = await client.post(url, data={"data": overpass_q})
                r.raise_for_status()
                data = r.json()
                break
            except Exception as e:
                logger.warning(f"Overpass {url} failed: {e}")
    if data is None:
        return TELEHEALTH  # never invent nearby clinics; telehealth is real and location-free

    results = []
    for elem in data.get("elements", []):
        tags = elem.get("tags", {})
        name = tags.get("name", "")
        if not name or (query and query.lower() not in name.lower()):
            continue
        p_lat = elem["lat"] if elem["type"] == "node" else elem.get("center", {}).get("lat", lat)
        p_lon = elem["lon"] if elem["type"] == "node" else elem.get("center", {}).get("lon", lon)
        results.append({
            "id": str(elem["id"]),
            "name": name,
            "type": AMENITY_MAP.get(tags.get("amenity", ""), "clinic"),
            "address": ", ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street"), tags.get("addr:city")])) or "Address unavailable",
            "lat": p_lat, "lon": p_lon,
            "phone": tags.get("phone") or tags.get("contact:phone"),
            "open_now": None,
            "accepts_uninsured": tags.get("fee") == "no" or None,
            "distance_km": round(_haversine(lat, lon, p_lat, p_lon), 2),
        })

    results.sort(key=lambda p: p["distance_km"])

    return results[:23] + TELEHEALTH

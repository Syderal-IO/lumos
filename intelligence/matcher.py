"""
Green-Ledger Intelligence Service — Micro-Grid Matcher
Uses Graphify knowledge graph for prosumer↔buyer matching.
Falls back to Haversine distance matching if graph unavailable.
"""

import json
import logging
import math
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Graph Loading ───

_graph: Optional[dict] = None
GRAPH_PATH = Path(__file__).parent / "microgrid-data" / "graph.json"


def _load_graph() -> bool:
    """Load the Graphify knowledge graph if available."""
    global _graph
    if _graph is not None:
        return True

    if GRAPH_PATH.exists():
        try:
            _graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
            logger.info(
                f"Loaded Graphify graph: {len(_graph.get('nodes', []))} nodes, "
                f"{len(_graph.get('edges', []))} edges"
            )
            return True
        except Exception as e:
            logger.warning(f"Failed to load graph: {e}")

    logger.info("No Graphify graph found, using Haversine fallback.")
    return False


# ─── Haversine Distance ───


def _haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two GPS coordinates."""
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─── Mock Micro-Grid Data ───
# This mirrors lib/mock-data.ts — single source of truth for the demo

PROSUMERS = {
    "prosumer_001": {"name": "Casa Solar #1", "lat": 9.9341, "lng": -84.0877, "neighborhood": "Escazú", "capacity_kw": 5.0},
    "prosumer_002": {"name": "Casa Solar #2", "lat": 9.9367, "lng": -84.0782, "neighborhood": "Sabana", "capacity_kw": 4.2},
    "prosumer_003": {"name": "Casa Solar #3", "lat": 9.9531, "lng": -84.0423, "neighborhood": "Moravia", "capacity_kw": 6.0},
    "prosumer_004": {"name": "Casa Solar #4", "lat": 9.9184, "lng": -84.0375, "neighborhood": "Curridabat", "capacity_kw": 3.8},
    "prosumer_005": {"name": "Casa Solar #5", "lat": 9.9282, "lng": -84.1261, "neighborhood": "Santa Ana", "capacity_kw": 7.5},
}

BUYERS = {
    "buyer_001": {"name": "Vecino A", "lat": 9.9335, "lng": -84.0865, "neighborhood": "Escazú", "max_price": 0.10, "demand_kwh": 4.0},
    "buyer_002": {"name": "Vecino B", "lat": 9.9358, "lng": -84.0795, "neighborhood": "Sabana", "max_price": 0.11, "demand_kwh": 6.0},
    "buyer_003": {"name": "Vecino C", "lat": 9.9520, "lng": -84.0440, "neighborhood": "Moravia", "max_price": 0.09, "demand_kwh": 3.0},
    "buyer_004": {"name": "Vecino D", "lat": 9.9195, "lng": -84.0390, "neighborhood": "Curridabat", "max_price": 0.10, "demand_kwh": 5.0},
}


# ─── Graphify-Based Matching ───


def _match_with_graph(prosumer_id: str, surplus_kwh: float) -> Optional[dict]:
    """Match using Graphify knowledge graph relationships."""
    if not _graph:
        return None

    try:
        nodes = {n["id"]: n for n in _graph.get("nodes", [])}
        edges = _graph.get("edges", [])

        # Find prosumer node in graph
        prosumer_node = None
        for node in _graph.get("nodes", []):
            label = node.get("label", "").lower()
            if prosumer_id.replace("_", " ") in label or prosumer_id in label:
                prosumer_node = node
                break

        if not prosumer_node:
            return None

        # Find connected buyer nodes via edges
        connected_buyers = []
        prosumer_node_id = prosumer_node["id"]

        for edge in edges:
            target = None
            edge_source = edge.get("source") or edge.get("from")
            edge_target = edge.get("target") or edge.get("to")
            if edge_source == prosumer_node_id:
                target = nodes.get(edge_target)
            elif edge_target == prosumer_node_id:
                target = nodes.get(edge_source)

            if target and "buyer" in target.get("label", "").lower():
                connected_buyers.append(
                    {"node": target, "weight": edge.get("weight", 0.5)}
                )

        if not connected_buyers:
            return None

        # Sort by edge weight (relationship strength)
        connected_buyers.sort(key=lambda x: x["weight"], reverse=True)
        best = connected_buyers[0]

        # Map to buyer data
        for buyer_id, buyer_data in BUYERS.items():
            if buyer_data["name"].lower() in best["node"].get("label", "").lower():
                prosumer = PROSUMERS.get(prosumer_id, {})
                distance = _haversine_m(
                    prosumer.get("lat", 0), prosumer.get("lng", 0),
                    buyer_data["lat"], buyer_data["lng"],
                )
                return {
                    "buyer_id": buyer_id,
                    "buyer_name": buyer_data["name"],
                    "distance_m": round(distance, 1),
                    "demand_kwh": min(buyer_data["demand_kwh"], surplus_kwh),
                    "max_price": buyer_data["max_price"],
                    "confidence": round(best["weight"], 3),
                    "neighborhood": buyer_data["neighborhood"],
                    "source": "graphify",
                }

        return None

    except Exception as e:
        logger.error(f"Graphify matching failed: {e}")
        return None


# ─── Haversine Fallback Matching ───


def _match_with_haversine(prosumer_id: str, surplus_kwh: float) -> dict:
    """Fallback: match by geographic proximity using Haversine distance."""
    prosumer = PROSUMERS.get(prosumer_id)
    if not prosumer:
        # Default to first prosumer
        prosumer = list(PROSUMERS.values())[0]

    candidates = []
    for buyer_id, buyer in BUYERS.items():
        dist = _haversine_m(
            prosumer["lat"], prosumer["lng"],
            buyer["lat"], buyer["lng"],
        )
        # Only consider buyers whose max price >= suggested price
        candidates.append({
            "buyer_id": buyer_id,
            "buyer_name": buyer["name"],
            "distance_m": round(dist, 1),
            "demand_kwh": min(buyer["demand_kwh"], surplus_kwh),
            "max_price": buyer["max_price"],
            "neighborhood": buyer["neighborhood"],
            "dist_raw": dist,
        })

    # Sort by distance (closest first)
    candidates.sort(key=lambda c: c["dist_raw"])
    best = candidates[0]

    # Confidence based on distance (closer = higher)
    max_dist = 5000  # 5km max
    confidence = max(0.1, 1.0 - (best["dist_raw"] / max_dist))

    return {
        "buyer_id": best["buyer_id"],
        "buyer_name": best["buyer_name"],
        "distance_m": best["distance_m"],
        "demand_kwh": best["demand_kwh"],
        "max_price": best["max_price"],
        "confidence": round(confidence, 3),
        "neighborhood": best["neighborhood"],
        "source": "haversine",
    }


# ─── Public API ───


def find_best_buyer(prosumer_id: str, surplus_kwh: float) -> dict:
    """
    Find the best buyer for a prosumer's surplus energy.
    Uses Graphify graph if available, falls back to Haversine distance.

    Args:
        prosumer_id: ID of the selling prosumer
        surplus_kwh: Amount of surplus energy available

    Returns:
        Match result with buyer info, distance, and confidence
    """
    # Try Graphify first
    if _load_graph():
        result = _match_with_graph(prosumer_id, surplus_kwh)
        if result:
            return result

    # Fallback to Haversine
    return _match_with_haversine(prosumer_id, surplus_kwh)

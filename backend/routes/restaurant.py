from fastapi import APIRouter, Query, HTTPException
from database.db import get_db_connection
import math

router = APIRouter()

@router.get("/restaurant/{restaurant_id}")
def get_restaurant(restaurant_id: int):
    """Fetch a restaurant by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM restaurants WHERE restaurant_id = ?", (restaurant_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return dict(row)

@router.get("/restaurants")
def get_restaurants(page: int = Query(1), per_page: int = Query(10)):
    """Fetch all restaurants with pagination."""
    offset = (page - 1) * per_page
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get total count
    cursor.execute("SELECT COUNT(*) FROM restaurants")
    total_count = cursor.fetchone()[0]

    # Fetch paginated results
    cursor.execute("SELECT * FROM restaurants LIMIT ? OFFSET ?", (per_page, offset))
    rows = cursor.fetchall()
    conn.close()

    total_pages = math.ceil(total_count / per_page)

    return {
        "data": [dict(row) for row in rows],
        "total_pages": total_pages,
        "current_page": page
    }

@router.get("/restaurants/search")
def search_restaurants(lat: float, lon: float, radius: float = 3, page: int = Query(1, alias="page"), per_page: int = Query(12, alias="per_page")):
    lat_km = 1 / 110.574  # 1 degree latitude ~ 110.574 km
    lon_km = 1 / (111.320 * (math.cos(math.radians(lat))))
    
    min_lat = lat - radius * lat_km
    max_lat = lat + radius * lat_km
    min_lon = lon - radius * lon_km
    max_lon = lon + radius * lon_km
    
    offset = (page - 1) * per_page
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get total count of matching restaurants
    count_query = "SELECT COUNT(*) FROM restaurants WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?"
    cursor.execute(count_query, (min_lat, max_lat, min_lon, max_lon))
    total_count = cursor.fetchone()[0]
    
    # Fetch paginated results
    query = "SELECT * FROM restaurants WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ? LIMIT ? OFFSET ?"
    cursor.execute(query, (min_lat, max_lat, min_lon, max_lon, per_page, offset))
    rows = cursor.fetchall()
    conn.close()
    
    total_pages = math.ceil(total_count / per_page)
    
    return {
        "data": [dict(row) for row in rows],
        "total_pages": total_pages,
        "current_page": page
    }
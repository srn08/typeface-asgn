from fastapi import APIRouter, Query, HTTPException
from database.db import get_db_connection
from models.schemas import NameRequest

router = APIRouter()

@router.post("/search-name")
async def search_name(request: NameRequest):
    """Search for restaurants where the name is similar (case-insensitive)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    search_query = f"%{request.restaurant_name.lower()}%"

    # Fetch paginated results
    query = "SELECT * FROM restaurants WHERE LOWER(restaurant_name) LIKE ?"
    cursor.execute(query, (search_query,))
    results = cursor.fetchall()
    conn.close()

    restaurants = [dict(row) for row in results]

    if not restaurants:
        return {
            "message": "No restaurants found",
            "cuisine": request.restaurant_name,
            "restaurants": [],
            "total_pages": "0",
            "current_page": "0"
        }

    return {
        "message": "Restaurants found",
        "cuisine": request.restaurant_name,
        "restaurants": restaurants,
        "total_pages": "1",
        "current_page": "1"
    }

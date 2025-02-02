from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import math
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel
from clarifai_grpc.grpc.api import resources_pb2, service_pb2, service_pb2_grpc
from clarifai_grpc.grpc.api.status import status_code_pb2

# Clarifai API Credentials
USER_ID = 'clarifai'
APP_ID = 'main'
MODEL_ID = 'food-item-recognition'
MODEL_VERSION_ID = ''  # Use latest version
PAT = 'b6b3fe1c3e9f45ecb8203e481e2591b0'  # Replace with your Clarifai API Key

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = sqlite3.connect("./zomato.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/restaurant/{restaurant_id}")
def get_restaurant(restaurant_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM restaurants WHERE restaurant_id = ?", (restaurant_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return dict(row)

@app.get("/restaurants")
def get_restaurants(page: int = Query(1, alias="page"), per_page: int = Query(10, alias="per_page")):
    offset = (page - 1) * per_page
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get total count of restaurants
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

@app.get("/restaurants/search")
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

# Request model for handling image URLs
class ImageRequest(BaseModel):
    image_url: str

@app.post("/search-by-image")
async def search_by_image_url(request: ImageRequest):
    """
    Send an image URL to Clarifai's food recognition model and return predictions.
    """
    try:
        # Connect to Clarifai API
        channel = ClarifaiChannel.get_grpc_channel()
        stub = service_pb2_grpc.V2Stub(channel)
        metadata = (('authorization', 'Key ' + PAT),)
        userDataObject = resources_pb2.UserAppIDSet(user_id=USER_ID, app_id=APP_ID)

        # Send image URL to Clarifai for recognition
        post_model_outputs_response = stub.PostModelOutputs(
            service_pb2.PostModelOutputsRequest(
                user_app_id=userDataObject,
                model_id=MODEL_ID,
                inputs=[
                    resources_pb2.Input(
                        data=resources_pb2.Data(
                            image=resources_pb2.Image(
                                url=request.image_url
                            )
                        )
                    )
                ]
            ),
            metadata=metadata
        )

        # Check if the request was successful
        if post_model_outputs_response.status.code != status_code_pb2.SUCCESS:
            raise HTTPException(status_code=500, detail=f"Clarifai API Error: {post_model_outputs_response.status.description}")

        # Extract food concepts
        output = post_model_outputs_response.outputs[0]
        recognized_foods = [concept.name.lower() for concept in output.data.concepts]

        detected_cuisine = None
        for cuisine, keywords in cuisines.items():
            if any(food in keywords for food in recognized_foods):
                detected_cuisine = cuisine
                break

        # If no cuisine is found, return a message
        if not detected_cuisine:
            return {
                "cuisine": "Could not understand the cuisine from the picture",
                "restaurants": []
            }

        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT * FROM restaurants 
            WHERE cuisines LIKE ?
        """
        cursor.execute(query, (f"%{detected_cuisine}%",))
        restaurants = cursor.fetchall()
        conn.close()

        # Convert database rows to a list of dictionaries
        restaurant_list = [dict(row) for row in restaurants]

        return {
            "cuisine": detected_cuisine,
            "restaurants": restaurant_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



cuisines = {
    "Afghani": ["kebab", "naan", "afghan food"],
    "African": ["jollof", "fufu", "suya"],
    "American": ["burger", "fries", "steak"],
    "Andhra": ["spicy", "biryani", "gongura"],
    "Arabian": ["shawarma", "hummus", "falafel"],
    "Argentine": ["asado", "empanada", "chimichurri"],
    "Armenian": ["lavash", "khorovats", "dolma"],
    "Asian": ["ramen", "sushi", "stir fry"],
    "Asian Fusion": ["fusion", "mix", "modern asian"],
    "Assamese": ["fish curry", "pithas", "assam tea"],
    "Australian": ["meat pie", "lamington", "vegemite"],
    "Awadhi": ["korma", "nihari", "galouti kebab"],
    "BBQ": ["barbecue", "grill", "smokehouse"],
    "Bakery": ["bread", "cake", "pastry"],
    "Bar Food": ["beer", "wings", "nachos"],
    "Belgian": ["waffle", "chocolate", "mussels"],
    "Bengali": ["rosogolla", "fish curry", "shorshe ilish"],
    "Beverages": ["juice", "soda", "cocktail"],
    "Bihari": ["litti chokha", "thekua", "dal puri"],
    "Biryani": ["biryani", "basmati rice", "spices"],
    "Brazilian": ["churrasco", "feijoada", "brigadeiro"],
    "Breakfast": ["pancakes", "omelette", "bacon"],
    "British": ["fish and chips", "roast", "pudding"],
    "Bubble Tea": ["boba", "tapioca", "milk tea"],
    "Burger": ["burger", "patty", "cheeseburger"],
    "Burmese": ["mohinga", "tea leaf salad", "laphet"],
    "Cafe": ["coffee", "sandwich", "brunch"],
    "Cajun": ["gumbo", "jambalaya", "crawfish"],
    "Canadian": ["poutine", "maple syrup", "bannock"],
    "Cantonese": ["dim sum", "char siu", "wonton"],
    "Caribbean": ["jerk chicken", "plantain", "ackee"],
    "Charcoal Grill": ["grilled", "barbecue", "smoked meat"],
    "Chettinad": ["spicy", "pepper chicken", "chettinad curry"],
    "Chinese": ["noodle","noodles", "dumplings", "fried rice"],
    "Coffee and Tea": ["latte", "espresso", "chai"],
    "Continental": ["steak", "pasta", "salad"],
    "Cuban": ["ropa vieja", "cubano sandwich", "mojito"],
    "Curry": ["curry", "masala", "gravy"],
    "Desserts": ["cake", "ice cream", "pudding"],
    "Deli": ["sandwich", "cold cuts", "bagel"],
    "Dim Sum": ["dumplings", "bao", "spring rolls"],
    "Diner": ["breakfast", "milkshake", "grill"],
    "Drinks Only": ["soda", "cocktail", "juice"],
    "European": ["pasta", "bread", "cheese"],
    "Fast Food": ["fries", "burger", "nuggets"],
    "Filipino": ["adobo", "halo-halo", "lechon"],
    "French": ["baguette", "croissant", "escargot"],
    "German": ["bratwurst", "pretzel", "sauerkraut"],
    "Greek": ["gyro", "tzatziki", "moussaka"],
    "Healthy Food": ["salad", "smoothie", "vegan"],
    "Hyderabadi": ["biryani", "mirchi ka salan", "double ka meetha"],
    "Indian": ["curry", "paneer", "dal"],
    "Italian": ["pizza", "pasta", "lasagna"],
    "Japanese": ["sushi", "ramen", "tempura"],
    "Korean": ["kimchi", "bibimbap", "bulgogi"],
    "Lebanese": ["hummus", "shawarma", "falafel"],
    "Mediterranean": ["olive oil", "hummus", "feta cheese"],
    "Mexican": ["tacos", "burrito", "guacamole"],
    "Middle Eastern": ["kebab", "shawarma", "falafel"],
    "Mughlai": ["biryani", "korma", "tandoori"],
    "North Indian": ["dal makhani", "paneer", "butter chicken"],
    "Pakistani": ["biryani", "nihari", "korma"],
    "Pizza": ["pepperoni", "cheese", "crust"],
    "Seafood": ["fish", "shrimp", "lobster"],
    "South Indian": ["dosa", "idli", "sambar"],
    "Spanish": ["paella", "tapas", "churros"],
    "Steak": ["ribeye", "sirloin", "grilled"],
    "Sushi": ["sushi","sashimi", "nigiri", "maki"],
    "Thai": ["pad thai", "green curry", "tom yum"],
    "Turkish": ["kebab", "baklava", "pide"],
    "Vietnamese": ["pho", "banh mi", "spring rolls"]
}
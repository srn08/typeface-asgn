from fastapi import APIRouter, HTTPException
from database.db import get_db_connection
from models.schemas import ImageRequest
from clarifai_grpc.channel.clarifai_channel import ClarifaiChannel
from clarifai_grpc.grpc.api import resources_pb2, service_pb2, service_pb2_grpc
from clarifai_grpc.grpc.api.status import status_code_pb2
import os

router = APIRouter()

# Load API credentials from environment variables
USER_ID = 'clarifai'
APP_ID = 'main'
MODEL_ID = 'food-item-recognition'
MODEL_VERSION_ID = ''  # Use latest version
PAT = 'b6b3fe1c3e9f45ecb8203e481e2591b0'

@router.post("/search-by-image")
async def search_by_image_url(request: ImageRequest):
    """Recognize food from an image URL, identify the cuisine, and return restaurants."""
    try:
        channel = ClarifaiChannel.get_grpc_channel()
        stub = service_pb2_grpc.V2Stub(channel)
        metadata = (("authorization", "Key " + PAT),)
        userDataObject = resources_pb2.UserAppIDSet(user_id=USER_ID, app_id=APP_ID)

        post_model_outputs_response = stub.PostModelOutputs(
            service_pb2.PostModelOutputsRequest(
                user_app_id=userDataObject,
                model_id=MODEL_ID,
                inputs=[
                    resources_pb2.Input(
                        data=resources_pb2.Data(
                            image=resources_pb2.Image(url=request.image_url)
                        )
                    )
                ]
            ),
            metadata=metadata
        )

        if post_model_outputs_response.status.code != status_code_pb2.SUCCESS:
            raise HTTPException(status_code=500, detail="Clarifai API Error")

        output = post_model_outputs_response.outputs[0]
        recognized_foods = [concept.name.lower() for concept in output.data.concepts]

        detected_cuisine = None

        for cuisine, keywords in cuisines.items():
            if any(food in keywords for food in recognized_foods):
                detected_cuisine = cuisine
                break

        if not detected_cuisine:
            return {"cuisine": "Could not determine cuisine", "restaurants": []}

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM restaurants WHERE cuisines LIKE ?", (f"%{detected_cuisine}%",))
        restaurants = cursor.fetchall()
        conn.close()

        return {"cuisine": detected_cuisine, "restaurants": [dict(row) for row in restaurants]}

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
    "Pizza": ["pizza","pepperoni", "cheese", "crust"],
    "Seafood": ["fish", "shrimp", "lobster"],
    "South Indian": ["dosa", "idli", "sambar"],
    "Spanish": ["paella", "tapas", "churros"],
    "Steak": ["ribeye", "sirloin", "grilled"],
    "Sushi": ["sushi","sashimi", "nigiri", "maki"],
    "Thai": ["pad thai", "green curry", "tom yum"],
    "Turkish": ["kebab", "baklava", "pide"],
    "Vietnamese": ["pho", "banh mi", "spring rolls"]
}
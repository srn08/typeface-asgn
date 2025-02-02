from pydantic import BaseModel

# Model for searching by name
class NameRequest(BaseModel):
    restaurant_name: str

# Model for searching by image
class ImageRequest(BaseModel):
    image_url: str

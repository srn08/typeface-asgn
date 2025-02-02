from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import restaurant, search, image_search

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


app.include_router(restaurant.router)
app.include_router(search.router)
app.include_router(image_search.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Restaurant API"}

import { useState } from 'react';
import './RestaurantSearch.css';
import RestaurantCard from './RestaurantCard';

const API_BASE = 'http://localhost:8000';

export function RestImageSearch() {
    const [imageUrl, setImageUrl] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [cuisine, setCuisine] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const searchByImage = () => {
        if (!imageUrl.trim()) {
            setError("Image URL is required.");
            return;
        }

        setLoading(true);
        setError("");

        fetch(`${API_BASE}/search-by-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image_url: imageUrl })
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch restaurants");
            return res.json();
        })
        .then(data => {
            if (data && data.cuisine) {
                setCuisine(data.cuisine);
                setRestaurants(data.restaurants || []);
            } else {
                throw new Error("Invalid API response");
            }
        })
        .catch(() => setError("Failed to fetch data."))
        .finally(() => setLoading(false));
    };

    return (
        <div className="container search-container">
            <h1>Search Restaurants by Image</h1>

            <div className="search-box">
                <input 
                    type="text"
                    className="input-field" 
                    placeholder="Enter Image URL" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                />
                <button onClick={searchByImage} className="search-btn">Search</button>
            </div>

            {error && <p className="error-msg">{error}</p>}

            {loading ? (
                <p className="loading">Loading...</p>
            ) : (
                <>
                    {cuisine && <h3 className="cuisine-text">Cuisine: {cuisine}</h3>}
                    
                    <div className="row">
                        {restaurants.length > 0 ? (
                            restaurants.map(restaurant => (
                                <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
                            ))
                        ) : (
                            <p className="text-center">No restaurants found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default RestImageSearch;

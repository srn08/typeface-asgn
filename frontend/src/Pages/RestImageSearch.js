import { useState } from 'react';
import '../Styles/RestaurantSearch.css';
import RestaurantCard from '../components/RestaurantCard';
import API_BASE from '../url';

export function RestImageSearch() {
    const [imageUrl, setImageUrl] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [cuisine, setCuisine] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if(!file) return;

        const data = new FormData();
        data.append("file",file);
        data.append("upload_preset", "file_upload");
        data.append("cloud_name", "dh1utfhob");

        const res = await fetch("https://api.cloudinary.com/v1_1/dh1utfhob/image/upload", {
            method:"POST",
            body: data
        }).catch((error) => {
            console.log(error);
        })

        const uploadedImageURL = await res.json();
        setImageUrl(uploadedImageURL.url);
    }


    const searchByImage = () => {
        if (!imageUrl.trim()) {
            setError("Too Soon! Wait for a second and then press the Search button again");
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
                    type="file"
                    className="input-field" 
                    accept='image/'
                    onChange={handleImageUpload}
                    // onChange={(e) => setImageUrl(e.target.value)} 
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

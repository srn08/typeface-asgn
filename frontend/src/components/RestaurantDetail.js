import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPhoneAlt, FaMapMarkerAlt, FaShareAlt, FaCommentDots } from 'react-icons/fa';
import './RestaurantDetail.css';

const API_BASE = 'http://localhost:8000';

export function RestaurantDetail() {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/restaurant/${id}`)
            .then(res => res.json())
            .then(data => setRestaurant(data));
    }, [id]);

    if (!restaurant) return <p>Loading...</p>;

    return (
        <div className="container restaurant-detail">
            <div className="row">
                <div className="col-md-6">
                    <h1 className="restaurant-name">{restaurant.restaurant_name}</h1>
                    <p className="restaurant-city">{restaurant.city}</p>
                    <p className="restaurant-address">
                        <FaMapMarkerAlt className="icon" /> {restaurant.address}
                    </p>
                    <p className="restaurant-phone">
                        <FaPhoneAlt className="icon" /> 
                        <a href={`tel:${restaurant.phone}`} className="phone-link">
                            {restaurant.phone}
                        </a>
                    </p>
                    <div className="action-buttons">
                        <button className="btn btn-outline-secondary">
                            <FaMapMarkerAlt /> Direction
                        </button>
                        <button className="btn btn-outline-secondary">
                            <FaShareAlt /> Share
                        </button>
                        <button className="btn btn-outline-secondary">
                            <FaCommentDots /> Reviews
                        </button>
                    </div>
                </div>

                <div className="col-md-6 rating-section">
                    <div className="rating delivery-rating">
                        <span className="rating-score green-bg">{restaurant.aggregate_rating} ⭐</span>
                        <span className="rating-label">{restaurant.total_delivery_ratings} {restaurant.rating_text}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RestaurantDetail;

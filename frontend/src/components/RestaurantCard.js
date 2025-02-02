import React from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
    return (
        <div className="col-md-4 col-sm-6">
            <Link to={`/restaurant/${restaurant.restaurant_id}`} className="restaurant-card-link">
                <div className="restaurant-card">
                    <div className="restaurant-info">
                        <h5>{restaurant.restaurant_name}</h5>
                        <p className="cuisine">{restaurant.cuisines}</p>
                        <div className="restaurant-details">
                            <span className="price">{restaurant.average_cost_for_two} {" "+restaurant.currency} for two</span>
                            <span className="rating">{restaurant.aggregate_rating} ⭐</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default RestaurantCard;

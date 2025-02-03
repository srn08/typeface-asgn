import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaMapMarkerAlt,FaMoneyBillWave } from 'react-icons/fa';
import { FaBowlFood } from "react-icons/fa6";
import { IoMdInformationCircleOutline } from "react-icons/io";
import '../Styles/RestaurantDetail.css';
import API_BASE from '../url';

// Page that shows all of the information about a Restaurant
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
                    <p><FaBowlFood className="icon"/>{restaurant.cuisines}</p>
                    <p><FaMoneyBillWave className="icon"/>{restaurant.average_cost_for_two} {" "+restaurant.currency} for two</p>
                    <p><IoMdInformationCircleOutline className="icon"/>{restaurant.has_table_booking==="Yes" ? "Restaurant allows booking tables" : "Restaurant doesn't allow booking tables"}</p>
                    <p><IoMdInformationCircleOutline className="icon"/>{restaurant.has_online_delivery==="Yes" ? "This Restaurant has online delivery" : "This Restaurant doesn't have online delivery"}</p>
                    <p><IoMdInformationCircleOutline className="icon"/>{restaurant.is_delivering_now==="Yes" ? "Restaurant is delivering right now" : "Restaurant is not delivering right now"}</p>
                </div>

                <div className="col-md-6 rating-section">
                    <div className="rating delivery-rating">
                        <span className="rating-score green-bg">{restaurant.aggregate_rating}⭐ ({restaurant.votes})</span>
                        <span className="rating-label">{restaurant.total_delivery_ratings} {restaurant.rating_text}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RestaurantDetail;

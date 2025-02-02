import { useState, useEffect, useRef } from 'react';
import './RestaurantSearch.css';
import RestaurantCard from './RestaurantCard';
import ReactPaginate from 'react-paginate';
import API_BASE from '../url';

export function RestaurantSearch() {
    const [lat, setLat] = useState(localStorage.getItem('lat') || '');
    const [lon, setLon] = useState(localStorage.getItem('lon') || '');
    const [radius, setRadius] = useState(localStorage.getItem('radius') || '');
    const [restaurants, setRestaurants] = useState(() => {
        const savedRestaurants = localStorage.getItem('restaurants');
        return savedRestaurants ? JSON.parse(savedRestaurants) : [];
    });
    const [totalPages, setTotalPages] = useState(() => {
        return localStorage.getItem('totalPages') ? parseInt(localStorage.getItem('totalPages')) : 1;
    });
    const [page, setPage] = useState(() => {
        return localStorage.getItem('searchPage') ? parseInt(localStorage.getItem('searchPage')) : 1;
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const perPage = 12;
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            if (restaurants.length === 0 && lat && lon && radius) {
                search(page, true);
            }
        }
    });

    const isValidNumber = (value) => /^\d*\.?\d+$/.test(value);

    const validateInputs = () => {
        if (!lat.trim() || !lon.trim() || !radius.trim()) {
            setError("All fields are required.");
            return false;
        }

        if (!isValidNumber(lat) || !isValidNumber(lon) || !isValidNumber(radius)) {
            setError("Latitude, Longitude, and Radius must be valid numbers.");
            return false;
        }

        const numLat = parseFloat(lat);
        const numLon = parseFloat(lon);
        const numRadius = parseFloat(radius);

        if (numLat < -90 || numLat > 90) {
            setError("Latitude must be between -90 and 90.");
            return false;
        }
        if (numLon < -180 || numLon > 180) {
            setError("Longitude must be between -180 and 180.");
            return false;
        }
        if (numRadius <= 0) {
            setError("Radius must be greater than 0.");
            return false;
        }

        setError("");
        return true;
    };

    const search = (newPage = 1, restore = false) => {
        if (!restore && !validateInputs()) return;

        setLoading(true);
        fetch(`${API_BASE}/restaurants/search?lat=${lat}&lon=${lon}&radius=${radius}&page=${newPage}&per_page=${perPage}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch restaurants");
                return res.json();
            })
            .then(data => {
                if (data && data.data) {
                    setRestaurants(data.data);
                    setTotalPages(data.total_pages || 1);
                    setPage(newPage);
                    
                    // Store search results and state
                    localStorage.setItem('restaurants', JSON.stringify(data.data));
                    localStorage.setItem('totalPages', data.total_pages || 1);
                    localStorage.setItem('searchPage', newPage);
                    localStorage.setItem('lat', lat);
                    localStorage.setItem('lon', lon);
                    localStorage.setItem('radius', radius);
                } else {
                    throw new Error("Invalid API response");
                }
            })
            .catch(() => setError("Failed to fetch restaurants."))
            .finally(() => setLoading(false));
    };

    const handlePageClick = (data) => {
        search(data.selected + 1);
    };

    return (
        <div className="container search-container">
            <h1>Search Restaurants</h1>

            <div className="search-box">
                <input 
                    type="text"
                    className="input-field" 
                    placeholder="Enter Latitude" 
                    value={lat} 
                    onChange={(e) => setLat(e.target.value)} 
                />
                <input 
                    type="text"
                    className="input-field" 
                    placeholder="Enter Longitude" 
                    value={lon} 
                    onChange={(e) => setLon(e.target.value)} 
                />
                <input 
                    type="text"
                    className="input-field"
                    placeholder="Enter Radius in km"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                />
                <button onClick={() => search(1)} className="search-btn">Search</button>
            </div>

            {error && <p className="error-msg">{error}</p>}

            {loading ? (
                <p className="loading">Loading...</p>
            ) : (
                <>
                    <div className="row">
                        {restaurants.length > 0 ? (
                            restaurants.map(restaurant => (
                                <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
                            ))
                        ) : (
                            <p className="text-center">No restaurants found.</p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <ReactPaginate
                                previousLabel={'<'}
                                nextLabel={'>'}
                                breakLabel={'...'}
                                pageCount={totalPages}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={3}
                                forcePage={page - 1}
                                onPageChange={handlePageClick}
                                containerClassName='pagination justify-content-center'
                                pageClassName='page-item'
                                pageLinkClassName='page-link'
                                previousClassName='page-item'
                                previousLinkClassName='page-link'
                                nextClassName='page-item'
                                nextLinkClassName='page-link'
                                breakClassName='page-item'
                                breakLinkClassName='page-link'
                                activeClassName='active'
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default RestaurantSearch;
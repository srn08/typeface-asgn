import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import '../Styles/Navbar.css';
import RestaurantCard from '../components/RestaurantCard';
import '../Styles/RestaurantCard.css';
import API_BASE from '../url';

export function RestaurantList() {
    const [restaurants, setRestaurants] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(() => {
        return localStorage.getItem('currentPage') ? parseInt(localStorage.getItem('currentPage')) : 1;
    });

    const perPage = 12;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!isSearching) {
            fetchRestaurants(page);
        }
    }, [page, isSearching]);

    const fetchRestaurants = (currentPage) => {
        setLoading(true);
        fetch(`${API_BASE}/restaurants?page=${currentPage}&per_page=${perPage}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch restaurants");
                return res.json();
            })
            .then(data => {
                if (data && data.data) {
                    setRestaurants(data.data);
                    setTotalPages(data.total_pages || 1);
                    localStorage.setItem('restaurantList', JSON.stringify(data.data));
                    localStorage.setItem('currentPage', currentPage);
                } else {
                    throw new Error("Invalid API response");
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setIsSearching(false);
            fetchRestaurants(page);
            return;
        }

        setIsSearching(true);
        setLoading(true);

        fetch(`${API_BASE}/search-name`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ restaurant_name: searchQuery })
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch restaurants");
                return res.json();
            })
            .then(data => {
                if (data && data.restaurants) {
                    setRestaurants(data.restaurants);
                    setTotalPages(1);
                } else {
                    throw new Error("Invalid API response");
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };


    const handlePageClick = (data) => {
        let currentPage = data.selected + 1;
        setPage(currentPage);
        localStorage.setItem('currentPage', currentPage);
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="container">
            <br />
            <div className="search-box">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search restaurant by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch} className="search-btn">Search</button>
            </div>

            <h1 className="text-center my-4">Restaurants</h1>

            <div className="row">
                {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
                    ))
                ) : (
                    <p className="text-center">No restaurants found.</p>
                )}
            </div>

            {!isSearching && totalPages > 1 && (
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
        </div>
    );
}

export default RestaurantList;

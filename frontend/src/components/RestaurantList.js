import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import './Navbar.css';
import RestaurantCard from './RestaurantCard';
import './RestaurantCard.css';
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

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/restaurants?page=${page}&per_page=${perPage}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to fetch restaurants");
                }
                return res.json();
            })
            .then(data => {
                if (data && data.data) {
                    setRestaurants(data.data);
                    setTotalPages(data.total_pages || 1);
                    localStorage.setItem('restaurantList', JSON.stringify(data.data));
                    localStorage.setItem('currentPage', page);
                } else {
                    throw new Error("Invalid API response");
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [page]);

    const handlePageClick = (data) => {
        let currentPage = data.selected + 1;
        setPage(currentPage);
        localStorage.setItem('currentPage', currentPage);
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="container">
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
        </div>
    );
}

export default RestaurantList;

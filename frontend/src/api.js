// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getRestaurantById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/restaurant/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Restaurant not found');
    }
};

export const getRestaurants = async (page = 1, per_page = 10) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/restaurants`, {
            params: { page, per_page: per_page },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch restaurants');
    }
};

export const searchRestaurants = async (lat, lon, radius = 3) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/restaurants/search`, {
            params: { lat, lon, radius },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to search restaurants');
    }
};
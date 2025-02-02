import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';

import RestaurantList from './components/RestaurantList';
import { RestaurantDetail } from './components/RestaurantDetail';
import { RestaurantSearch } from './components/RestaurantSearch';
import Navbar from './components/Navbar';
import RestImageSearch from './components/RestImageSearch';

const App = () => {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path="/" element={<RestaurantList />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/search" element={<RestaurantSearch />} />
                <Route path="search-by-image" element={<RestImageSearch/>}/>
            </Routes>
        </Router>
    );
};

export default App;


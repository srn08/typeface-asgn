import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import RestaurantList from './Pages/RestaurantList';
import { RestaurantSearch } from './Pages/RestaurantSearch';
import RestImageSearch from './Pages/RestImageSearch';
import { RestaurantDetail } from './components/RestaurantDetail';
import Navbar from './components/Navbar';


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


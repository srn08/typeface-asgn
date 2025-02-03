import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Navbar.css'

const Navbar = () => {
  return (
    <div className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Zomato Database</Link>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">Browse</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">Search</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search-by-image">Search by Image</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
import React from 'react';
import './Navbar.css';

function Navbar({ setActivePage }) {
  return (
    <nav className="navbar">
      <a href="#" className="navbar-brand">Admin Panel</a>
      <ul className="navbar-nav">
        <li className="cursor-pointer" onClick={() => setActivePage('menu')}>
          <a href="#">Menu Items</a>
        </li>
        <li className="cursor-pointer" onClick={() => setActivePage('add-item')}>
          <a href="#">Add Item</a>
        </li>
        <li className="cursor-pointer" onClick={() => setActivePage('orders')}>
          <a href="#">Orders</a>
        </li>
        <li className="cursor-pointer" onClick={() => setActivePage('analytics')}>
  <a href="#">Analytics</a>
</li>

      </ul>
      <div className="navbar-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}

export default Navbar;
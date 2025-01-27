import React from 'react';
import './Navbar.css';
function Navbar({ setActivePage }) {
  return (
    <nav className="p-4 bg-gray-800 text-white">
      <ul className="flex space-x-4">
        <li className="cursor-pointer" onClick={() => setActivePage('menu')}>
          Menu Items
        </li>
        <li className="cursor-pointer" onClick={() => setActivePage('add-item')}>
          Add Item
        </li>
        <li className="cursor-pointer" onClick={() => setActivePage('orders')}>
          Orders
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

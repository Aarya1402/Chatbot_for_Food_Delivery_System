import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; // Make sure App.css is present or adjust the path

function MenuItems() {
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios
      .get('https://chatbot-for-food-delivery-system.onrender.com/menu')
      .then((response) => setMenuItems(response.data))
      .catch((error) => console.error('Error fetching menu items:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditClick = (item) => {
    setEditingItem(item.itemId);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || '',
    });
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      axios
        .delete(`https://chatbot-for-food-delivery-system.onrender.com/menu/${itemId}`)
        .then(() => {
          setMenuItems((prevItems) => prevItems.filter((item) => item.itemId !== itemId));
        })
        .catch((error) => {
          console.error('Error deleting menu item:', error);
        });
    }
  };

  const handleUpdateItem = () => {
    axios
      .put(`https://chatbot-for-food-delivery-system.onrender.com/menu/${editingItem}`, formData)
      .then((response) => {
        setMenuItems((prevItems) =>
          prevItems.map((item) =>
            item.itemId === editingItem ? { ...item, ...formData } : item
          )
        );
        setSuccessMessage('Item updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setEditingItem(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          imageUrl: '',
        });
      })
      .catch((error) => {
        console.error('Error updating menu item:', error);
      });
  };

  const toggleDescription = (itemId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 30 ? description.slice(0, 30) + '...' : description;
  };

  return (
    <div className="menu-items-container">
      <h2 className="text-xl font-bold mb-4">Menu Items</h2>

      {successMessage && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="menu-items-grid">
        {menuItems.map((item) => (
          <div key={item.itemId} className="menu-item-card">
            <div className="menu-item-content">
              <h3 className="font-semibold">{item.name}</h3>
              <p>
                {expandedDescriptions[item.itemId]
                  ? item.description
                  : truncateDescription(item.description)}
                {item.description && item.description.length > 30 && (
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() => toggleDescription(item.itemId)}
                  >
                    {expandedDescriptions[item.itemId] ? ' Less' : ' More'}
                  </span>
                )}
              </p>
              <p>Price: ₹{item.price}</p>
              <p>Category: {item.category}</p>

              {item.imageUrl && (
                <div className="mb-10">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="menu-item-image rounded-lg"
                    style={{ width: "300px", height: "180px", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Action Buttons - Only show Edit/Delete when not editing */}
              {editingItem !== item.itemId && (
                <div className="mt-10 flex">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-8"
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    onClick={() => handleDeleteItem(item.itemId)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Edit Form */}
            {editingItem === item.itemId && (
              <div className="edit-form mt-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Item Name"
                  className="block mb-2 p-2 border rounded w-full"
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="block mb-2 p-2 border rounded w-full"
                />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  className="block mb-2 p-2 border rounded w-full"
                />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Category"
                  className="block mb-2 p-2 border rounded w-full"
                />
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Image URL"
                  className="block mb-2 p-2 border rounded w-full"
                />
                
                {/* Update and Cancel buttons with explicit margin instead of flex gap */}
                <div className="mt-4 flex">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-8"
                    onClick={handleUpdateItem}
                  >
                    Update Item
                  </button>
                  <button
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setEditingItem(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;
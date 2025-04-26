import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; // Import your CSS file

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
  const [successMessage, setSuccessMessage] = useState(''); // ✅ New: to show update success message

  // Fetch menu items on component mount
  useEffect(() => {
    axios
      .get('https://chatbot-for-food-delivery-system.onrender.com/menu')
      .then((response) => setMenuItems(response.data))
      .catch((error) => console.error('Error fetching menu items:', error));
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle clicking Edit button
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

  // Handle updating the item
  const handleUpdateItem = () => {
    console.log('Updating item:', formData, editingItem);
    axios
      .put(`https://chatbot-for-food-delivery-system.onrender.com/menu/${editingItem}`, formData)
      .then((response) => {
        setMenuItems((prevItems) =>
          prevItems.map((item) =>
            item.itemId === editingItem
              ? { ...item, ...formData } // ✅ Merge old item and updated fields
              : item
          )
        );

        setSuccessMessage('Item updated successfully!'); // ✅ Show success message
        setTimeout(() => setSuccessMessage(''), 3000); // Hide after 3 seconds

        // Reset form
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

  // Toggle description expansion
  const toggleDescription = (itemId) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  // Truncate long descriptions
  const truncateDescription = (description) => {
    if (!description) return '';
    if (description.length > 30) {
      return description.slice(0, 30) + '...';
    }
    return description;
  };

  return (
    <div className="menu-items-container">
      <h2 className="text-xl font-bold mb-4">Menu Items</h2>

      {successMessage && ( // ✅ Show success message if any
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

              <div className="mt-10">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-7"
                  onClick={() => handleEditClick(item)}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* If editing, show edit form */}
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
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                  onClick={handleUpdateItem}
                >
                  Update Item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;

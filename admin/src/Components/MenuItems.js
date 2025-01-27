import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MenuItems() {
  const [menuItems, setMenuItems] = useState([]); // State to store menu items
  const [editingItem, setEditingItem] = useState(null); // State to track which item is being edited
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });

  // Fetch all menu items on component mount
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

  // Handle editing a menu item
  const handleEditClick = (item) => {
    setEditingItem(item.itemId); // Set the itemId of the item being edited
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl || '', // Handle missing image URL
    });
  };

  // Handle updating a menu item
  const handleUpdateItem = () => {
    axios
      .put(`https://chatbot-for-food-delivery-system.onrender.com/menu/${editingItem}`, formData)
      .then((response) => {
        // Update the menu items state with the updated item
        setMenuItems((prevItems) =>
          prevItems.map((item) => (item.itemId === editingItem ? response.data : item))
        );

        // Reset the editing state and form data
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Menu Items</h2>
      <ul>
        {menuItems.map((item) => (
          <li key={item.itemId} className="border-b py-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p>{item.description}</p>
                <p>Price: ₹{item.price}</p>
                <p>Category: {item.category}</p>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-32 h-32 object-cover mt-2"
                  />
                )}
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleEditClick(item)}
              >
                Edit
              </button>
            </div>
            {editingItem === item.itemId && (
              <div className="mt-4">
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MenuItems;
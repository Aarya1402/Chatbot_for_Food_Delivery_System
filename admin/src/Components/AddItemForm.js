import React, { useState } from "react";
import axios from "axios";

function AddMenuItemForm() {
  const [formData, setFormData] = useState({
    itemId: "",
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(" http://localhost:5000/menu", formData); // Replace with your API endpoint
      alert("Menu item added successfully!");
      setFormData({
        itemId: "",
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add the menu item. Please try again.");
    }
  };

  return (
    <form className="p-4 border rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>

      <div className="mb-4">
        <label className="block">Item ID:</label>
        <input
          type="text"
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block">Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block">Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block">Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block">Category:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block">Image URL:</label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Add Menu Item
      </button>
    </form>
  );
}

export default AddMenuItemForm;

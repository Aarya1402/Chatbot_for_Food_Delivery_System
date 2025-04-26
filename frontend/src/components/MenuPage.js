import React, { useState, useEffect } from "react";
import "./styles.css";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);

  // Fetch and set menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("https://chatbot-for-food-delivery-system.onrender.com/menu");
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <div>
      <header>
        <nav>
          <a href="#menu">Menu</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <div className="main-container">
        {/* Left Section: Menu Cards */}
        <section id="menu">
          <h2>Our Menu</h2>
          <div className="grid-container">
            {menuItems.map((item) => (
              <div key={item.id} className="card">
                <img src={item.imageUrl} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="price">Price: ₹{item.price}</p>
                <p className="category">Category: {item.category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right Section: Chatbot */}
        <aside className="chat-container">     
          <iframe
            className="chat-bot"
            allow="microphone;"
            src="https://console.dialogflow.com/api-client/demo/embedded/28c02c65-3c22-4efc-a3be-f5af3f5a4885"
            title="Chatbot"
          ></iframe> 
          <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>

          <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>

        </aside>
      </div>
    </div>
  );
};

export default MenuPage;

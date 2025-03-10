import React, { useState } from "react";
import OngoingOrders from "./OngoingOrders";
import CompletedOrders from "./CompletedOrders";
import CancelledOrders from "./CancelledOrders";
import '../App.css'; // Ensure you import the CSS file

function Orders() {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger re-fetch in child components
  const refreshOrders = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "ongoing" ? "active" : ""}`}
          onClick={() => setActiveTab("ongoing")}
        >
          Ongoing Orders
        </button>
        <button
          className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed Orders
        </button>
        <button
          className={`tab-button ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled Orders
        </button>
      </div>
      <div className="tab-content">
        {activeTab === "ongoing" && <OngoingOrders onOrderUpdate={refreshOrders} />}
        {activeTab === "completed" && <CompletedOrders refreshKey={refreshKey} />}
        {activeTab === "cancelled" && <CancelledOrders refreshKey={refreshKey} />}
      </div>
    </div>
  );
}

export default Orders;
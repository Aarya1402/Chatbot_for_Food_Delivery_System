import React, { useEffect, useState } from "react";
import axios from "axios";

function OngoingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch ongoing orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(" http://localhost:5000/orders/status/Pending"); // Using the `GET /status/:status` endpoint
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(` http://localhost:5000/orders/${orderId}`, { status: newStatus }); // Using the `PUT /:orderId` endpoint
      alert(`Order ${orderId} marked as ${newStatus.toLowerCase()}!`);
      fetchOrders(); // Refresh the list of orders
    } catch (err) {
      console.error(`Error updating order ${orderId}:`, err);
      alert("Failed to update the order. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrders(); // Fetch orders on component mount
  }, []);

  return (
    <div className="mt-4">
      <h3 className="font-bold">Ongoing Orders</h3>
      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.orderId} className="border-b py-2 flex justify-between items-center">
            <div>
              <span className="font-semibold">Order #{order.orderId}</span> - Amount:  ₹{order.amount.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => updateOrderStatus(order.orderId, "Completed")}
              >
                Complete
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => updateOrderStatus(order.orderId, "Cancelled")}
              >
                Cancel
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && orders.length === 0 && !error && (
        <p className="text-gray-500">No ongoing orders available.</p>
      )}
    </div>
  );
}

export default OngoingOrders;

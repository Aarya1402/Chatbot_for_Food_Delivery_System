import React, { useEffect, useState } from "react";
import axios from "axios";

function OngoingOrders({ onOrderUpdate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://chatbot-for-food-delivery-system.onrender.com/orders/status/Pending");
      setOrders(response.data);
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to ${newStatus}`);
      // Update order status in the backend
      await axios.put(`https://chatbot-for-food-delivery-system.onrender.com/orders/${orderId}/status`, { status: newStatus });
      alert(`Order ${orderId} marked as ${newStatus.toLowerCase()}!`);
      fetchOrders();
      onOrderUpdate(); // Trigger refresh in parent
    } catch (err) {
      alert("Failed to update the order.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="mt-4">
      <h3 className="font-bold">Ongoing Orders</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.orderId} className="border-b py-2 flex justify-between">
            <div>
              <span className="font-semibold">Order #{order.orderId}</span> - ₹{order.amount.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <div className="flex gap-x-4 my-2">
                <div className="flex space-x-4 my-2">
                  <div className="flex gap-x-4 my-2">
                    <div className="flex items-center space-x-4 my-2">

                      <button
                        className="px-4 py-2 bg-green-500 text-white"
                        onClick={() => updateOrderStatus(order.orderId, "Completed")}
                      >
                        Complete
                      </button>

                      <button
                        className="px-4 py-2 bg-red-500 text-white"
                        onClick={() => updateOrderStatus(order.orderId, "Cancelled")}
                      >
                        Cancel
                      </button>

                    </div>


                  </div>


                </div>

              </div>

            </div>
          </li>
        ))}
      </ul>
      {!loading && orders.length === 0 && !error && <p className="text-gray-500">No ongoing orders.</p>}
    </div>
  );
}

export default OngoingOrders;

import React, { useEffect, useState } from "react";
import axios from "axios";

function OngoingOrders({ onOrderUpdate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [itemNames, setItemNames] = useState({});

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

  const fetchItemName = async (itemId) => {
    try {
      const response = await axios.get(`https://chatbot-for-food-delivery-system.onrender.com/menu/${itemId}`);
      return response.data.name;
    } catch (err) {
      console.error(`Failed to fetch name for item ${itemId}`, err);
      return "Unknown Item";
    }
  };

  const loadItemNamesForOrder = async (order) => {
    const names = { ...itemNames };
    const promises = order.items.map(async (item) => {
      if (!names[item.itemId]) {
        const name = await fetchItemName(item.itemId);
        names[item.itemId] = name;
      }
    });
    await Promise.all(promises);
    setItemNames(names);
  };

  const toggleExpand = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      const order = orders.find(o => o.orderId === orderId);
      if (order) {
        await loadItemNamesForOrder(order);
      }
      setExpandedOrderId(orderId);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to ${newStatus}`);
      await axios.put(`https://chatbot-for-food-delivery-system.onrender.com/orders/${orderId}/status`, { status: newStatus });
      alert(`Order ${orderId} marked as ${newStatus.toLowerCase()}!`);
      fetchOrders();
      onOrderUpdate();
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
          <li key={order.orderId} className="border-b py-2">
            <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleExpand(order.orderId)}>
              <div>
                <span className="font-semibold">Order #{order.orderId}</span> - ₹{order.amount.toFixed(2)}
                {expandedOrderId === order.orderId && (
                  <div className="mt-2 bg-gray-100 p-3 rounded">
                    {/* <p><strong>User ID:</strong> {order.userId || "Guest"}</p> */}
                    {/* <p><strong>Payment Status:</strong> {order.payStatus}</p> */}
                    <p className="mt-2"><strong>Items:</strong></p>
                    <ul className="list-disc pl-5">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <li key={index} className="mb-2">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-8 bg-white p-2 rounded shadow-sm">
                              <div><strong>Item Name:</strong> {itemNames[item.itemId] || "Loading..."}</div>
                              <div><strong>Quantity:</strong> {item.qty}</div>
                              <div><strong>Total:</strong> ₹{item.total.toFixed(2)}</div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li>No items in this order.</li>
                      )}
                    </ul>

                  </div>
                )}
              </div>

              {/* Buttons stay on right side */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
          </li>
        ))}
      </ul>
      {!loading && orders.length === 0 && !error && <p className="text-gray-500">No ongoing orders.</p>}
    </div>
  );
}

export default OngoingOrders;

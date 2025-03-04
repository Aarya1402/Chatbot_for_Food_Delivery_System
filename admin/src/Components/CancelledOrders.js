import React, { useEffect, useState } from "react";
import axios from "axios";

function CancelledOrders({ refreshKey }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("https://chatbot-for-food-delivery-system.onrender.com/orders/status/Cancelled")
      .then(response => setOrders(response.data))
      .catch(error => console.error(error));
  }, [refreshKey]); // Refetch when refreshKey changes

  return (
    <div className="mt-4">
      <h3 className="font-bold">Cancelled Orders</h3>
      <ul>
        {orders.map(order => (
          <li key={order.orderId} className="border-b py-2">
            Order #{order.orderId} - ₹{order.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CancelledOrders;

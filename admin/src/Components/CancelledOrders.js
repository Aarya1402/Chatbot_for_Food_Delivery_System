import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CancelledOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(' http://localhost:5000/orders?status=Cancelled')
      .then(response => setOrders(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="mt-4">
      <h3 className="font-bold">Cancelled Orders</h3>
      <ul>
        {orders.map(order => (
          <li key={order.orderId} className="border-b py-2">
            Order #{order.orderId} -  ₹{order.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CancelledOrders;

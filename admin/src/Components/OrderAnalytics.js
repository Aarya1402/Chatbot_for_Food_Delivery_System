import React, { useEffect, useState } from 'react';
import './OrderAnalytics.css'; // Optional for styling

function OrderAnalytics({ refresh }) {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  const fetchOrders = () => {
    fetch('https://chatbot-for-food-delivery-system.onrender.com/orders/')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        console.log('Fetched orders:', data); // Debugging line
        if (data && data.length > 0) {
          // 🛠️ Filter only completed orders
          const completedOrders = data.filter(order => order.status === 'Completed');
          console.log('Completed orders:', completedOrders); // Debugging line
          const revenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
          const avgValue = completedOrders.length > 0 ? revenue / completedOrders.length : 0;
  
          setTotalRevenue(revenue);
          setAverageOrderValue(avgValue.toFixed(2));
        }
      })
      .catch(err => console.error('Error fetching orders:', err));
  };
  

  useEffect(() => {
    fetchOrders();
  }, [refresh]);  // <-- Now useEffect depends on `refresh`

  return (
    <div className="analytics-page">
      <section className="analytics-section">
        <h3>Order & Sales Overview</h3>
        <div className="analytics-grid">
          <div className="analytics-card">Total Orders: <strong>{orders.length}</strong></div>
          <div className="analytics-card">Total Revenue: <strong>₹{totalRevenue}</strong></div>
          <div className="analytics-card">Avg Order Value: <strong>₹{averageOrderValue}</strong></div>
        </div>
      </section>
    </div>
  );
}

export default OrderAnalytics;

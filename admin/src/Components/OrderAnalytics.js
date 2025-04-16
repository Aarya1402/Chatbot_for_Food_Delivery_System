import React, { useEffect, useState } from 'react';
import './OrderAnalytics.css'; // Optional for styling

function OrderAnalytics() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  useEffect(() => {
    fetch('https://chatbot-for-food-delivery-system.onrender.com/orders/')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        if (data && data.length > 0) {
          const revenue = data.reduce((sum, order) => sum + order.amount, 0);
          const avgValue = revenue / data.length;
          setTotalRevenue(revenue);
          setAverageOrderValue(avgValue.toFixed(2));
        }
      })
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

  return (
    <div className="analytics-page">
      {/* <h2>📊 Analytics Dashboard</h2> */}
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

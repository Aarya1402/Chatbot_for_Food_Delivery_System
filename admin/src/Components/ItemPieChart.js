import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ItemPieChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchOrdersAndMenu = async () => {
      const orderRes = await fetch('https://chatbot-for-food-delivery-system.onrender.com/orders/');
      const menuRes = await fetch('https://chatbot-for-food-delivery-system.onrender.com/menu');

      const orders = await orderRes.json();
      const menu = await menuRes.json();

      const itemCount = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          itemCount[item.itemId] = (itemCount[item.itemId] || 0) + item.qty;
        });
      });

      const labels = [];
      const data = [];
      const backgroundColors = [];
      const itemNames = [];

      menu.forEach((menuItem, i) => {
        if (itemCount[menuItem.itemId]) {
          labels.push(menuItem.name);
          data.push(itemCount[menuItem.itemId]);
          backgroundColors.push(`hsl(${i * 35}, 70%, 60%)`);
          itemNames.push({ name: menuItem.name, count: itemCount[menuItem.itemId], color: `hsl(${i * 35}, 70%, 60%)` });
        }
      });

      setChartData({
        labels,
        datasets: [
          {
            label: 'Items Ordered',
            data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
        itemList: itemNames
      });
    }; 

    fetchOrdersAndMenu();
  }, []);

  return (
    <section className="analytics-section">
      <h3> Item Order Distribution</h3>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ width: '400px', height: '400px' }}>
          {chartData ? (
            <Pie
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                rotation: -0.5 * Math.PI, // Rotates 90 degrees clockwise
              }}
            />
          ) : (
            <p>Loading chart data...</p>
          )}
        </div>

       
      </div>
    </section>
  );
};

export default ItemPieChart;

import React from 'react';
import './AnalyticsPage.css';
import OrderAnalytics from './OrderAnalytics';
import ItemPieChart from './ItemPieChart';

function AnalyticsPage() {
  return (
    <div className="analytics-container">
      <h2> Admin Analytics Dashboard</h2>

        
       <OrderAnalytics />

      <ItemPieChart/>
    </div>
  );
}

export default AnalyticsPage;

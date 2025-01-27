import React from 'react';
import OngoingOrders from './OngoingOrders';
import CompletedOrders from './CompletedOrders';
import CancelledOrders from './CancelledOrders';

function Orders() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Orders</h2>
      <OngoingOrders />
      <CompletedOrders />
      <CancelledOrders />
    </div>
  );
}

export default Orders;

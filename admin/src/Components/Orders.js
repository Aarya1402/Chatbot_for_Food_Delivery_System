import React, { useState } from "react";
import OngoingOrders from "./OngoingOrders";
import CompletedOrders from "./CompletedOrders";
import CancelledOrders from "./CancelledOrders";

function Orders() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger re-fetch in child components
  const refreshOrders = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Orders</h2>
      <OngoingOrders onOrderUpdate={refreshOrders} />
      <CompletedOrders refreshKey={refreshKey} />
      <CancelledOrders refreshKey={refreshKey} />
    </div>
  );
}

export default Orders;

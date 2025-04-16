import React from 'react';
import Navbar from './Components/Navbar';
import MenuItems from './Components/MenuItems';
import AddItemForm from './Components/AddItemForm';
import Orders from './Components/Orders';
import AnalyticsPage from './Components/AnalyticsPage'; // ✅ Step 1: Import Analytics Page
import './App.css';

function App() {
  const [activePage, setActivePage] = React.useState('menu');

  const renderPage = () => {
    switch (activePage) {
      case 'menu':
        return <MenuItems />;
      case 'add-item':
        return <AddItemForm />;
      case 'orders':
        return <Orders />;
      case 'analytics': // ✅ Step 2: Add Analytics Case
        return <AnalyticsPage />;
      default:
        return <MenuItems />;
    }
  };

  return (
    <div>
      <Navbar setActivePage={setActivePage} />
      <div>{renderPage()}</div>
    </div>
  );
}

export default App;

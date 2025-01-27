import React from 'react';
import Navbar from './Components/Navbar';
import MenuItems from './Components/MenuItems';
import AddItemForm from './Components/AddItemForm';
import Orders from './Components/Orders';
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

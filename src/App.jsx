import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Profile from './components/Profile/Profile';
import Order from './components/Order/Order';
import Menu from './components/Menu/Menu';
import Slider from './components/Party/Slider';
import Auth from './components/Auth/Auth';

const App = (props) => {
  return (
    <div className='app-wrapper'>
      <Header />
      <div className='app-wrapper-content'>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/orders" element={<Order/>} />
          <Route path="/menu" element={<Menu/>} />
          <Route path="/party" element={<Slider/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

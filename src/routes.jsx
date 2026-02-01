import React from 'react';
import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';
import Order from './components/Order/Order';
import Menu from './components/Menu/Menu';
import Slider from './components/Party/Slider';

const routes = [
  { path: '/', element: <Home /> },
  { path: '/auth', element: <Auth /> },
  { path: '/orders', element: <Order /> },
  { path: '/menu', element: <Menu /> },
  { path: '/events', element: <Slider /> },
];

export default routes;

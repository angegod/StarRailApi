import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Menu from './component/Menu.js';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router basename="/StarRailApi">
      <Menu />
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

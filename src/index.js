import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import Menu from './component/Menu.js';
import NotFound from './component/NotFound.js';
import Simulator from './component/relic_simulator.js';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));


function NotAllowed() {
  throw new Error('Route not allowed');
}

function Sitemap() {
  React.useEffect(() => {
      window.location.href = '/StarRailApi/sitemap.xml'; // 重定向到靜態 sitemap.xml 文件
  }, []);

  return null;
}

root.render(
  <>
  <BrowserRouter basename="/StarRailApi/">
      <Menu />
      <Routes>
        <Route index path="/" element={<App />} />
        <Route path="/simulate" element={<Simulator />} />
        <Route path="/sitemap.xml" element={<Sitemap />} />
        <Route path="*" element={<NotAllowed />} />
      </Routes>
  </BrowserRouter>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

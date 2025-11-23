// main.jsx or index.jsx - Updated
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThirdwebProvider } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "./lib/client";

import { StateContextProvider } from './context';
import App from './App';
import './index.css';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThirdwebProvider client={client}>
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider>
);
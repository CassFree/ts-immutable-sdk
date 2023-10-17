import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ConnectUI from './components/ui/connect/connect';
import WalletUI from './components/ui/wallet/wallet';
import SwapUI from './components/ui/swap/swap';
import BridgeUI from './components/ui/bridge/bridge';
import OnRampUI from "./components/ui/on-ramp/onRamp";
import { BiomeCombinedProviders } from '@biom3/react';
import { PassportLoginCallback } from './components/ui/marketplace-orchestrator/PassportLoginCallback';
import { Marketplace } from './components/ui/marketplace-orchestrator';
import { onDarkBase } from '@biom3/design-tokens';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/connect',
    element: <ConnectUI />,
  },
  {
    path: '/wallet',
    element: <WalletUI />,
  },
  {
    path: '/swap',
    element: <SwapUI />,
  },
  {
    path: '/bridge',
    element: <BridgeUI />,
  },
  {
    path: '/on-ramp',
    element: <OnRampUI />,
  },
  {
    path: '/marketplace-orchestrator',
    element: <BiomeCombinedProviders theme={{base: onDarkBase}}><Marketplace /></BiomeCombinedProviders>,
  },
  {
    path: '/marketplace-orchestrator/login/callback',
    element: <PassportLoginCallback />
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

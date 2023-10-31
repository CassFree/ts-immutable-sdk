import { useEffect } from 'react';

import { Environment } from '@imtbl/config';
import { IMTBLWidgetEvents, WalletEventType, WalletNetworkSwitchEvent, WalletProviderName } from '@imtbl/checkout-sdk';

function WalletUI() {


  useEffect(() => {
    const handleWalletWidgetEvents = ((event: CustomEvent) => {
      console.log(event);
      switch (event.detail.type) {
        case WalletEventType.CLOSE_WIDGET: {
          const eventData = event.detail.data as any;
          console.log(eventData);
          break;
        }
        case WalletEventType.NETWORK_SWITCH: {
          const eventData = event.detail.data as WalletNetworkSwitchEvent;
          console.log(eventData.network);
          break;
        }
        default:
          console.log('did not match any expected event type');
      }
    }) as EventListener;
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
      handleWalletWidgetEvents
    );
    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        handleWalletWidgetEvents
      );
    };
  }, []);
  return (
    <div>
      <h1 className="sample-heading">Checkout Wallet</h1>
      <div id="wallet"></div>
    </div>
  );
}

export default WalletUI;

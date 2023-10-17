/* eslint-disable react/jsx-no-constructed-context-values */
import { BiomeCombinedProviders } from '@biom3/react';
import { Checkout, ConnectTargetLayer, ConnectWidgetProps } from '@imtbl/checkout-sdk';
import {
  useContext, useMemo, useEffect, useReducer, useCallback,
} from 'react';
import {
  sendCloseWidgetEvent,
  sendConnectFailedEvent,
  sendConnectSuccessEvent,
} from './ConnectWidgetEvents';
import {
  ConnectActions,
  ConnectContext,
  connectReducer,
  initialConnectState,
} from './context/ConnectContext';
import { ConnectWidgetView, ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { ConnectWallet } from './views/ConnectWallet';
import { ReadyToConnect } from './views/ReadyToConnect';
import { SwitchNetworkZkEVM } from './views/SwitchNetworkZkEVM';
import { LoadingView } from '../../views/loading/LoadingView';
import { ConnectLoaderSuccess } from '../../components/ConnectLoader/ConnectLoaderSuccess';
import {
  viewReducer,
  initialViewState,
  ViewActions,
  ViewContext,
  SharedViews,
} from '../../context/view-context/ViewContext';
import { StatusType } from '../../components/Status/StatusType';
import { StatusView } from '../../components/Status/StatusView';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { getTargetLayerChainId } from '../../lib';
import { SwitchNetworkEth } from './views/SwitchNetworkEth';
import { ErrorView } from '../../views/error/ErrorView';
import { text } from '../../resources/text/textConfig';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { widgetTheme } from '../../lib/theme';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { identifyUser } from '../../lib/analytics/identifyUser';

export type ConnectWidgetInputs = ConnectWidgetProps & {
  config: StrongCheckoutWidgetsConfig
  deepLink?: ConnectWidgetViews;
  sendCloseEventOverride?: () => void;
};

export function ConnectWidget(props: ConnectWidgetInputs) {
  const {
    config, sendCloseEventOverride, targetLayer, web3Provider, passport,
  } = props;

  const { deepLink = ConnectWidgetViews.CONNECT_WALLET } = props;
  const { environment, theme } = config;

  const errorText = text.views[SharedViews.ERROR_VIEW].actionText;

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const [connectState, connectDispatch] = useReducer(connectReducer, initialConnectState);
  const { sendCloseEvent, provider, walletProviderName } = connectState;

  const [viewState, viewDispatch] = useReducer(viewReducer, initialViewState);
  const { view } = viewState;

  const connectReducerValues = useMemo(
    () => ({ connectState, connectDispatch }),
    [connectState, connectDispatch],
  );
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );
  const themeReducerValue = useMemo(() => widgetTheme(theme), [theme]);

  const networkToSwitchTo = targetLayer ?? ConnectTargetLayer.LAYER2;

  const checkout = new Checkout({ baseConfig: { environment } });
  const targetChainId = getTargetLayerChainId(checkout.config, targetLayer ?? ConnectTargetLayer.LAYER2);

  const { identify, page } = useAnalytics();

  useEffect(() => {
    if (!web3Provider) return;
    connectDispatch({
      payload: {
        type: ConnectActions.SET_PROVIDER,
        provider: web3Provider,
      },
    });
  }, [web3Provider]);

  useEffect(() => {
    if (!passport) return;

    connectDispatch({
      payload: {
        type: ConnectActions.SET_PASSPORT,
        passport,
      },
    });
  }, [passport]);

  useEffect(() => {
    connectDispatch({
      payload: {
        type: ConnectActions.SET_CHECKOUT,
        checkout,
      },
    });

    connectDispatch({
      payload: {
        type: ConnectActions.SET_SEND_CLOSE_EVENT,
        sendCloseEvent: sendCloseEventOverride ?? (() => sendCloseWidgetEvent(eventTarget)),
      },
    });
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: deepLink,
        } as ConnectWidgetView,
      },
    });
  }, [deepLink, sendCloseEventOverride, environment]);

  useEffect(() => {
    if (viewState.view.type !== SharedViews.ERROR_VIEW) return;
    sendConnectFailedEvent(eventTarget, viewState.view.error.message);
  }, [viewState]);

  const handleConnectSuccess = useCallback(async () => {
    if (!provider) return;
    // WT-1698 Analytics - Identify user here
    page({
      userJourney: UserJourney.CONNECT,
      screen: 'ConnectSuccess',
    });
    await identifyUser(identify, provider);
    sendConnectSuccessEvent(eventTarget, provider, walletProviderName ?? undefined);
  }, [provider, identify]);

  return (
    <BiomeCombinedProviders theme={{ base: themeReducerValue }}>
      <ViewContext.Provider value={viewReducerValues}>
        <ConnectContext.Provider value={connectReducerValues}>
          <>
            {view.type === SharedViews.LOADING_VIEW && (
              <LoadingView loadingText="Connecting" />
            )}
            {view.type === ConnectWidgetViews.CONNECT_WALLET && (
              <ConnectWallet />
            )}
            {view.type === ConnectWidgetViews.READY_TO_CONNECT && (
              <ReadyToConnect targetChainId={targetChainId} />
            )}
            {view.type === ConnectWidgetViews.SWITCH_NETWORK && networkToSwitchTo === ConnectTargetLayer.LAYER2 && (
              <SwitchNetworkZkEVM />
            )}
            {view.type === ConnectWidgetViews.SWITCH_NETWORK && networkToSwitchTo === ConnectTargetLayer.LAYER1 && (
              <SwitchNetworkEth />
            )}
            {view.type === ConnectWidgetViews.SUCCESS && provider && (
              <ConnectLoaderSuccess>
                <StatusView
                  statusText="Connection secure"
                  actionText="Continue"
                  onActionClick={() => sendCloseEvent()}
                  onRenderEvent={handleConnectSuccess}
                  statusType={StatusType.SUCCESS}
                  testId="success-view"
                />
              </ConnectLoaderSuccess>
            )}
            {((view.type === ConnectWidgetViews.SUCCESS && !provider)
            || view.type === SharedViews.ERROR_VIEW)
              && (
                <ErrorView
                  actionText={errorText}
                  onActionClick={() => {
                    viewDispatch({
                      payload: {
                        type: ViewActions.UPDATE_VIEW,
                        view: {
                          type: ConnectWidgetViews.CONNECT_WALLET,
                        } as ConnectWidgetView,
                      },
                    });
                  }}
                  onCloseClick={() => sendCloseEvent()}
                />
              )}
          </>
        </ConnectContext.Provider>
      </ViewContext.Provider>
    </BiomeCombinedProviders>
  );
}

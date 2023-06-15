import {
  Box, Heading, Icon, MenuItem,
} from '@biom3/react';
import {
  IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';
import {
  ReactNode, useContext, useEffect, useState,
} from 'react';
import { GasEstimateBridgeToL2Result, GasEstimateSwapResult, GasEstimateType } from '@imtbl/checkout-sdk';
import { FooterLogo } from '../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { SharedViews, ViewActions, ViewContext } from '../../context/view-context/ViewContext';
import { text } from '../../resources/text/textConfig';
import {
  orchestrationEvents,
} from '../../lib/orchestrationEvents';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { WalletContext } from '../../widgets/wallet/context/WalletContext';
import { getBridgeFeeEstimation, getSwapFeeEstimation } from '../../lib/feeEstimation';
import { CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { useTokenSymbols } from '../../lib/hooks/useTokenSymbols';
import { useInterval } from '../../lib/hooks/useInterval';

interface TopUpViewProps {
  widgetEvent: IMTBLWidgetEvents,
  showOnrampOption: boolean,
  showSwapOption: boolean,
  showBridgeOption: boolean,
  tokenAddress?: string,
  amount?: string,
  onCloseButtonClick: () => void,
  onBackButtonClick?: () => void,
}

export function TopUpView({
  widgetEvent,
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  tokenAddress,
  amount,
  onCloseButtonClick,
  onBackButtonClick,
}: TopUpViewProps) {
  const { header, topUpOptions } = text.views[SharedViews.TOP_UP_VIEW];
  const { onramp, swap, bridge } = topUpOptions;
  const { viewDispatch } = useContext(ViewContext);
  const { walletState } = useContext(WalletContext);
  const { checkout } = walletState;
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { conversions, fiatSymbol } = cryptoFiatState;

  const DEFAULT_FEE_REFRESH_INTERVAL = 30000;
  useTokenSymbols(checkout, cryptoFiatDispatch);
  const [swapFeesInFiat, setSwapFeesInFiat] = useState('-.--');
  const [bridgeFeesInFiat, setBridgeFeesInFiat] = useState('-.--');
  const [loadingSwapFees, setLoadingSwapFees] = useState(false);
  const [loadingBridgeFees, setLoadingBridgeFees] = useState(false);

  const onClickOnramp = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT) {
      // dispatch onramp view
    }
    orchestrationEvents.sendRequestOnrampEvent(widgetEvent, {
      tokenAddress: tokenAddress ?? '',
      amount: amount ?? '',
    });
  };

  const refreshFees = async (silent: boolean = false) => {
    if (!checkout) return;

    if (!silent) {
      setLoadingSwapFees(true);
      setLoadingBridgeFees(true);
    }

    try {
      const swapEstimate = await checkout.gasEstimate({
        gasEstimateType: GasEstimateType.SWAP,
      }) as GasEstimateSwapResult;
      const swapFeeInFiat = getSwapFeeEstimation(
        swapEstimate,
        conversions,
      );
      setSwapFeesInFiat(swapFeeInFiat);
      setLoadingSwapFees(false);
    } catch {
      setSwapFeesInFiat('-.--');
    } finally {
      setLoadingSwapFees(false);
    }

    try {
      const bridgeEstimate = await checkout.gasEstimate({
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      }) as GasEstimateBridgeToL2Result;
      const bridgeFeeInFiat = getBridgeFeeEstimation(
        bridgeEstimate,
        conversions,
      );
      setBridgeFeesInFiat(bridgeFeeInFiat);
    } catch {
      setBridgeFeesInFiat('-.--');
    } finally {
      setLoadingBridgeFees(false);
    }
  };
  useInterval(() => refreshFees(true), DEFAULT_FEE_REFRESH_INTERVAL);

  useEffect(() => {
    if (!checkout) return;
    if (conversions.size === 0) return;
    refreshFees();
  }, [checkout, conversions]);

  const onClickSwap = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.SWAP,
            data: {
              toContractAddress: tokenAddress ?? '',
              fromAmount: '',
              fromContractAddress: '',
            },
          },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestSwapEvent(widgetEvent, {
      fromTokenAddress: '',
      toTokenAddress: tokenAddress ?? '',
      amount: '',
    });
  };

  const onClickBridge = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.BRIDGE },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestBridgeEvent(widgetEvent, {
      tokenAddress: '',
      amount: '',
    });
  };

  const renderFees = (fees: string, feesLoading: boolean): ReactNode => {
    if (feesLoading) {
      return (
        <>
          {' '}
          <Icon icon="Loading" />
          {` ${fiatSymbol.toLocaleUpperCase()}`}
        </>
      );
    }
    return (` $${fees} ${fiatSymbol.toLocaleUpperCase()}`);
  };

  const renderMenuItem = (
    testId: string,
    icon: 'Wallet' | 'Coins' | 'Minting',
    heading: string,
    caption: string,
    subcaption: string,
    onClick: () => void,
    renderFeeFunction?: (fees: string, feesLoading: boolean) => ReactNode,
  ) => (
    <Box sx={{ paddingY: '1px' }}>
      <MenuItem
        testId={`menu-item-${testId}`}
        size="medium"
        emphasized
        onClick={onClick}
      >
        <MenuItem.Icon
          icon={icon}
        />
        <MenuItem.Label size="medium">
          {heading}
        </MenuItem.Label>
        <MenuItem.IntentIcon />
        <MenuItem.Caption testId={`menu-item-caption-${testId}`}>
          {caption}
          <br />
          {`${subcaption}`}
          {renderFeeFunction && renderFeeFunction(swapFeesInFiat, loadingSwapFees)}
        </MenuItem.Caption>
      </MenuItem>
    </Box>
  );

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          onBackButtonClick={onBackButtonClick ?? undefined}
          onCloseButtonClick={onCloseButtonClick}
          showBack
        />
      )}
      footer={(
        <FooterLogo />
      )}
    >
      <Box sx={{ paddingX: 'base.spacing.x4', paddingY: 'base.spacing.x4' }}>
        <Heading size="small">{header.title}</Heading>
        <Box sx={{ paddingY: 'base.spacing.x4' }}>
          {showOnrampOption && renderMenuItem(
            'onramp',
            'Wallet',
            onramp.heading,
            onramp.caption,
            onramp.subcaption,
            onClickOnramp,
          )}
          {showSwapOption && renderMenuItem(
            'swap',
            'Coins',
            swap.heading,
            swap.caption,
            swap.subcaption,
            onClickSwap,
            () => renderFees(swapFeesInFiat, loadingSwapFees),
          )}
          {showBridgeOption && renderMenuItem(
            'bridge',
            'Minting',
            bridge.heading,
            bridge.caption,
            bridge.subcaption,
            onClickBridge,
            () => renderFees(bridgeFeesInFiat, loadingBridgeFees),
          )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
import React from 'react';
import {
  ConnectTargetLayer,
  IMTBLWidgetEvents,
  OnRampWidgetParams,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
  WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { ConnectLoader, ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from 'lib';
import { CustomAnalyticsProvider } from 'context/analytics-provider/CustomAnalyticsProvider';
import { isValidAddress, isValidAmount } from 'lib/validations/widgetValidators';
import { BiomePortalIdProvider } from '@biom3/react';
import { OnRampWidget } from './OnRampWidget';
import { sendOnRampWidgetCloseEvent } from './OnRampWidgetEvents';

export class OnRamp extends Base<WidgetType.ONRAMP> {
  protected eventTopic: IMTBLWidgetEvents = IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT;

  protected getValidatedProperties(
    { config }: WidgetProperties<WidgetType.ONRAMP>,
  ): WidgetProperties<WidgetType.ONRAMP> {
    let validatedConfig: WidgetConfiguration | undefined;

    if (config) {
      validatedConfig = config;
      if (config.theme === WidgetTheme.LIGHT) validatedConfig.theme = WidgetTheme.LIGHT;
      else validatedConfig.theme = WidgetTheme.DARK;
    }

    return {
      config: validatedConfig,
    };
  }

  protected getValidatedParameters(params: OnRampWidgetParams): OnRampWidgetParams {
    const validatedParams = params;

    if (!isValidAmount(params.amount)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "amount" widget input');
      validatedParams.amount = '';
    }

    if (!isValidAddress(params.contractAddress)) {
      // eslint-disable-next-line no-console
      console.warn('[IMTBL]: invalid "contractAddress" widget input');
      validatedParams.contractAddress = '';
    }

    return validatedParams;
  }

  protected render() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER2,
      walletProviderName: this.parameters.walletProviderName,
      web3Provider: this.web3Provider,
      checkout: this.checkout,
      allowedChains: [getL1ChainId(this.checkout.config), getL2ChainId(this.checkout.config)],
    };

    if (!this.reactRoot) return;

    this.reactRoot.render(
      <React.StrictMode>
        <BiomePortalIdProvider>
          <CustomAnalyticsProvider widgetConfig={this.strongConfig()}>
            <ConnectLoader
              widgetConfig={this.strongConfig()}
              params={connectLoaderParams}
              closeEvent={() => sendOnRampWidgetCloseEvent(window)}
            >
              <OnRampWidget
                contractAddress={this.parameters.contractAddress}
                amount={this.parameters.amount}
                config={this.strongConfig()}
              />
            </ConnectLoader>
          </CustomAnalyticsProvider>
        </BiomePortalIdProvider>
      </React.StrictMode>,
    );
  }
}
import { Environment } from '@imtbl/config';
import { useState, useEffect } from 'react';
import { ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '../../../../lib';

function InnerWidgetWebView() {
  const [theme, setTheme] = useState(WidgetTheme.DARK);
  const [environment, setEnvironment] = useState(Environment.SANDBOX);

  const queryParams = new URLSearchParams(window.location.search);
  const themeParam = queryParams.get('theme');
  const environmentParam = queryParams.get('environment');

  useEffect(() => {
    if (themeParam) setTheme(themeParam as WidgetTheme);
    if (environmentParam) setEnvironment(environmentParam as Environment);
  }, [themeParam, environmentParam]);

  return (
    <imtbl-inner-widget-example
      providerPreference={ConnectionProviders.METAMASK}
      theme={theme}
      environment={environment}
    />
  );
}

export default InnerWidgetWebView;
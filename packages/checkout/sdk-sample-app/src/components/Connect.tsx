import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';

interface ConnectProps {
  checkout: Checkout;
  setProvider: (provider: Web3Provider) => void;
  provider: Web3Provider | undefined;
}

export default function Connect(props: ConnectProps) {
  const { setProvider, checkout, provider } = props;

  const [result, setResult] = useState<Web3Provider>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function connectClick() {
    if (!checkout) {
      console.error('missing checkout, please connect first');
      return;
    }
    if (!provider) {
      console.error('missing provider, please connect first');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resp = await checkout.connect({
        provider,
        requestWalletPermissions: true,
      });
      setProvider(resp.provider);
      setResult(resp.provider);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  useEffect(() => {
    // reset state when checkout changes from environment switch
    setResult(undefined);
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <div>
      <LoadingButton onClick={connectClick} loading={loading}>
        Connect
      </LoadingButton>
      {result && !error && <SuccessMessage>Connected.</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </div>
  );
}

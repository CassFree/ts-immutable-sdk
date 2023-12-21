import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { Box } from '@biom3/react';
import { createAndConnectToProvider, isPassportProvider } from 'lib/providerUtils';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  TokenInfo,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { DEFAULT_TRANSACTIONS_RETRY_POLICY, getL1ChainId, getL2ChainId } from 'lib';
import {
  CheckoutApi, Transaction, TransactionType,
} from 'lib/clients';
import { Environment } from '@imtbl/config';
import { retry } from 'lib/retry';
import { getChainSlugById } from 'lib/chains';
import { CryptoFiatActions, CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { sendBridgeWidgetCloseEvent } from '../../widgets/bridge/BridgeWidgetEvents';
import { Shimmer } from './Shimmer';
import {
  supportBoxContainerStyle,
  transactionsContainerStyle,
  transactionsListContainerStyle,
  transactionsListStyle,
} from './TransactionsStyles';
import { EmptyStateNotConnected } from './EmptyStateNotConnected';
import { SupportMessage } from './SupportMessage';
import { KnownNetworkMap } from './transactionsType';
import { TransactionsInProgress } from './TransactionsInProgress';
import { NoTransactions } from './NoTransactions';

type TransactionsProps = {
  checkout: Checkout
};

export function Transactions({ checkout }: TransactionsProps) {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { page } = useAnalytics();

  const { layoutHeading } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);
  const [knownTokenMap, setKnownTokenMap] = useState<KnownNetworkMap | undefined>(undefined);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const walletAddress = useCallback(async () => await provider?.getSigner().getAddress(), [provider]);
  const isPassport = isPassportProvider(provider);

  const txnsListStyle = useMemo(() => transactionsListStyle(isPassport), []);

  // Fetch the tokens for the root chain using the allowed tokens.
  // In case this list does not have all the tokens, there is logic
  // built into the <TransactionsInProgress /> component to fetch the
  // the missing data.
  const rootChainTokensHashmap = useCallback(async () => {
    if (!checkout) return {};

    const rootChainId = getL1ChainId(checkout.config);
    try {
      const tokens = (await checkout.config.remote.getTokensConfig(rootChainId)).allowed ?? [];
      return tokens.reduce((out, current) => {
        // eslint-disable-next-line no-param-reassign
        out[current.address!.toLowerCase()] = current;
        return out;
      }, {});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return [];
    }
  }, [checkout]);

  // Fetch the tokens for the root chain using the user balances tokens.
  // In case this list does not have all the tokens, there is logic
  // built into the <TransactionsInProgress /> component to fetch the
  // the missing data.
  const childChainTokensHashmap = useCallback(async () => {
    if (!provider) return {};

    const address = await walletAddress();
    if (!address) return {};

    const childChainId = getL2ChainId(checkout.config);

    try {
      const data = await checkout.getAllBalances({ provider, walletAddress: address, chainId: childChainId });
      return data.balances.reduce((out, current) => {
        // eslint-disable-next-line no-param-reassign
        out[current.token.address!.toLowerCase()] = current.token;
        return out;
      }, {});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return [];
    }
  }, [checkout, provider, walletAddress]);

  const updateAndConnectProvider = useCallback(async (walletProviderName: WalletProviderName) => {
    try {
      setProvider(await createAndConnectToProvider(checkout, walletProviderName));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [checkout]);

  const getTokensDetails = async (
    tokensWithChainSlug: { [p: string]: string },
  ) => {
    const rootChainName = getChainSlugById(getL1ChainId(checkout.config));
    const childChainName = getChainSlugById(getL2ChainId(checkout.config));

    const [rootData, childData] = await Promise.all([
      rootChainTokensHashmap(),
      childChainTokensHashmap(),
    ]);

    // Fetch the data for the missing tokens: tokensWithChainSlug
    const missingTokens: { [k:string]:string } = {};
    Object.entries(tokensWithChainSlug).forEach(
      ([key, value]) => {
        if ((tokensWithChainSlug[key] === rootChainName && !rootData[key])
        || (tokensWithChainSlug[key] === childChainName && !childData[key])) missingTokens[key] = value;
      },
    );
    // Root provider is always L1
    const rootProvider = new JsonRpcProvider(
      checkout.config.networkMap.get(getL1ChainId(checkout.config))?.rpcUrls[0],
    );

    // Child provider is always L2
    const childProvider = new JsonRpcProvider(
      checkout.config.networkMap.get(getL2ChainId(checkout.config))?.rpcUrls[0],
    );

    const rootTokenInfoPromises: Promise<TokenInfo | undefined>[] = [];
    const childTokenInfoPromises: Promise<TokenInfo | undefined>[] = [];

    Object.entries(missingTokens).forEach(
      ([tokenAddress, chainName]) => {
        if (chainName === rootChainName) {
          // Root provider
          rootTokenInfoPromises.push(
            checkout.getTokenInfo({
              provider: rootProvider,
              tokenAddress,
            }),
          );
        } else {
          // child provider
          childTokenInfoPromises.push(
            checkout.getTokenInfo({
              provider: childProvider,
              tokenAddress,
            }),
          );
        }
      },
    );
    const rootTokenInfo = await Promise.allSettled(rootTokenInfoPromises);
    const childTokenInfo = await Promise.allSettled(childTokenInfoPromises);

    ((rootTokenInfo.filter((result) => result.status === 'fulfilled')) as PromiseFulfilledResult<TokenInfo>[])
      .forEach((result) => {
        const resp = result;
        rootData[resp.value.address!.toLowerCase()] = resp.value;
      });

    ((childTokenInfo.filter((result) => result.status === 'fulfilled')) as PromiseFulfilledResult<TokenInfo>[])
      .forEach((result) => {
        const resp = result;
        childData[resp.value.address!.toLowerCase()] = resp.value;
      });

    const allTokenSymbols: string[] = [];
    Object.values(rootData).forEach((token) => allTokenSymbols.push((token as TokenInfo).symbol.toLowerCase()));
    Object.values(childData).forEach((token) => allTokenSymbols.push((token as TokenInfo).symbol.toLowerCase()));

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: allTokenSymbols,
      },
    });

    return { [rootChainName]: rootData, [childChainName]: childData };
  };

  const getTransactionsDetails = async (env: Environment, address: string) => {
    const client = new CheckoutApi({ env });
    return client.getTransactions({ txType: TransactionType.BRIDGE, fromAddress: address });
  };

  const fetchData = async () => {
    const address = await walletAddress();
    if (!address) return undefined;

    const localTxs = await getTransactionsDetails(checkout.config.environment, address);

    const tokensWithChainSlug:{ [k:string]:string } = {};
    localTxs.result.forEach((txn) => {
      tokensWithChainSlug[txn.details.from_token_address] = txn.details.from_chain;
    });
    return { tokens: await getTokensDetails(tokensWithChainSlug), transactions: localTxs.result };
  };

  // Fetch all the data at once
  useEffect(() => {
    (async () => {
      const data = await retry(fetchData, DEFAULT_TRANSACTIONS_RETRY_POLICY);
      if (!data) return;

      setKnownTokenMap(data.tokens);
      setTxs(data.transactions);

      setLoading(false);
    })();
  }, [walletAddress, checkout]);

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'Transactions',
    });
  }, []);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box sx={transactionsContainerStyle}>
        <Box sx={transactionsListContainerStyle}>
          {!provider && (
            <EmptyStateNotConnected
              checkout={checkout}
              updateProvider={updateAndConnectProvider}
            />
          )}
          {provider && loading
            && (
              <Box sx={txnsListStyle}>
                <Shimmer />
              </Box>
            )}
          {provider && !loading && txs.length > 0 && knownTokenMap && (
            <Box sx={txnsListStyle}>
              <TransactionsInProgress
                checkout={checkout}
                transactions={txs}
                knownTokenMap={knownTokenMap}
              />
            </Box>
          )}
          {provider && !loading && txs.length === 0 && (
            <NoTransactions
              checkout={checkout}
              isPassport={isPassport}
            />
          )}
        </Box>
        {provider && txs.length > 0 && (
          <Box sx={supportBoxContainerStyle}>
            <SupportMessage
              checkout={checkout}
              isPassport={isPassport}
            />
          </Box>
        )}
      </Box>
    </SimpleLayout>
  );
}
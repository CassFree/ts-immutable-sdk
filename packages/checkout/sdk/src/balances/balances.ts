import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, utils } from 'ethers';
import {
  ChainId,
  ENVIRONMENT_L1_CHAIN_MAP,
  ENVIRONMENT_L2_CHAIN_MAP,
  ERC20ABI,
  GetAllBalancesResult,
  GetBalanceResult,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { CheckoutConfiguration } from '../config';
import { CheckoutApiService } from '../service/checkoutApiService';
import { TokenBalancesResult } from '../service/checkoutApiServiceL1RpcNode';

export const getBalance = async (
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  walletAddress: string,
): Promise<GetBalanceResult> => await withCheckoutError<GetBalanceResult>(
  async () => {
    const networkInfo = await getNetworkInfo(config, web3Provider);

    if (!networkInfo.isSupported) {
      throw new CheckoutError(
        `Chain:${networkInfo.chainId} is not a supported chain`,
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        { chainName: networkInfo.name },
      );
    }

    const balance = await web3Provider.getBalance(walletAddress);
    return {
      balance,
      formattedBalance: utils.formatUnits(
        balance,
        networkInfo.nativeCurrency.decimals,
      ),
      token: networkInfo.nativeCurrency,
    };
  },
  { type: CheckoutErrorType.GET_BALANCE_ERROR },
);

export async function getERC20Balance(
  web3Provider: Web3Provider,
  walletAddress: string,
  contractAddress: string,
) {
  return await withCheckoutError<GetBalanceResult>(
    async () => {
      const contract = new Contract(
        contractAddress,
        JSON.stringify(ERC20ABI),
        web3Provider,
      );
      const name = await contract.name();
      const symbol = await contract.symbol();
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      const formattedBalance = utils.formatUnits(balance, decimals);
      return {
        balance,
        formattedBalance,
        token: {
          name,
          symbol,
          decimals,
          address: contractAddress,
        },
      } as GetBalanceResult;
    },
    { type: CheckoutErrorType.GET_ERC20_BALANCE_ERROR },
  );
}

async function getL1Balances(
  checkoutApiService: CheckoutApiService,
  config: CheckoutConfiguration,
  walletAddress: string,
  chainId: ChainId,
): Promise<GetBalanceResult[]> {
  const balanceResult: GetBalanceResult[] = [];
  const tokensMissingMetadata: TokenBalancesResult[] = [];
  const tokenList = await checkoutApiService
    .getL1RpcNode()
    .getTokenBalances({ walletAddress });
  const { tokenBalances } = tokenList;

  const cachedTokens = await config.remoteConfigFetcher.getTokens(chainId);

  tokenBalances.forEach((tokenBalance: TokenBalancesResult) => {
    const cachedToken = cachedTokens.find(
      (token: TokenInfo) => (token.address ?? '') === tokenBalance.contractAddress,
    );
    if (cachedToken) {
      balanceResult.push({
        balance: BigNumber.from(tokenBalance.tokenBalance),
        formattedBalance: utils.formatUnits(
          tokenBalance.tokenBalance,
          cachedToken.decimals,
        ),
        token: cachedToken,
      });
    } else {
      tokensMissingMetadata.push(tokenBalance);
    }
  });

  const metaDataForRestOfTheTokens = await checkoutApiService
    .getL1RpcNode()
    .getTokensMetadata({
      tokens: tokensMissingMetadata.map((token) => token.contractAddress),
    });

  tokensMissingMetadata.forEach((token: TokenBalancesResult) => {
    const tokenMetadata = metaDataForRestOfTheTokens.find(
      (metaData) => metaData.address === token.contractAddress,
    );
    if (tokenMetadata) {
      balanceResult.push({
        balance: BigNumber.from(token.tokenBalance),
        formattedBalance: utils.formatUnits(
          token.tokenBalance,
          tokenMetadata.decimals,
        ),
        token: tokenMetadata,
      });
    }
  });

  return balanceResult;
}

async function getL2Balances(
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  walletAddress: string,
  chainId: ChainId,
): Promise<GetBalanceResult[]> {
  const balanceResult: GetBalanceResult[] = [];
  const allBalancePromises: Promise<GetBalanceResult>[] = [];
  const cachedTokens = await config.remoteConfigFetcher.getTokens(chainId);

  allBalancePromises.push(getBalance(config, web3Provider, walletAddress));

  cachedTokens
    .filter((token: TokenInfo) => token.address)
    .forEach((token: TokenInfo) => allBalancePromises.push(
      getERC20Balance(web3Provider, walletAddress, token.address!),
    ));
  //
  // const balanceResults = await Promise.allSettled(allBalancePromises);
  // const getBalanceResults = (
  //   balanceResults.filter(
  //     (result) => result.status === 'fulfilled',
  //   ) as PromiseFulfilledResult<GetBalanceResult>[]
  // ).map(
  //   (fulfilledResult: PromiseFulfilledResult<GetBalanceResult>) => fulfilledResult.value,
  // ) as GetBalanceResult[];

  return balanceResult;
}

export const getAllBalances = async (
  config: CheckoutConfiguration,
  checkoutApiService: CheckoutApiService,
  web3Provider: Web3Provider,
  walletAddress: string,
  chainId: ChainId,
): Promise<GetAllBalancesResult> => {
  if (chainId === ENVIRONMENT_L1_CHAIN_MAP[config.environment]) {
    const balances = await getL1Balances(
      checkoutApiService,
      config,
      walletAddress,
      chainId,
    );
    return { balances };
  }

  if (chainId === ENVIRONMENT_L2_CHAIN_MAP[config.environment]) {
    const balances = await getL2Balances(
      config,
      web3Provider,
      walletAddress,
      chainId,
    );
    return { balances };
  }

  throw new CheckoutError(
    `Chain:${chainId} is not a supported chain`,
    CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
  );
};

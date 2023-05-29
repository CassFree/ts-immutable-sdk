import { Web3Provider } from '@ethersproject/providers';
// TODO: fix circular dependency
// eslint-disable-next-line import/no-cycle
import { NetworkInfo } from './networkInfo';
import { ChainId } from './chainId';

export enum DefaultProviders {
  METAMASK = 'metamask',
}

export interface CreateProviderParams {
  providerName: DefaultProviders;
}

export type CreateProviderResult = GenericProvider;

export type SetProviderParams = GenericProvider;

export interface SetProviderResult {
  providers: Providers;
  currentProviderInfo: CurrentProviderInfo;
}

export type Providers = {
  [key in DefaultProviders | string]: ProviderForChain;
};

export type ProviderForChain = {
  [key in ChainId | number]: Web3Provider;
};

export interface GenericProvider {
  name: string | DefaultProviders;
  web3Provider: Web3Provider;
}

export interface CurrentProviderInfo {
  name?: string | DefaultProviders;
  network?: NetworkInfo;
}

export interface ProviderParams {
  provider?: Web3Provider | CachedProvider;
}

export interface CachedProvider {
  name: string | DefaultProviders;
  chainId: ChainId;
}
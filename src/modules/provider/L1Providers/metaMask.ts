import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

import { MetamaskConnectParams } from './types';
import { WALLET_ACTION } from './rpc';

// FIXME: keep?
export const L1_METAMASK_ERRORS = {
  PROVIDER_NOT_FOUND: 'The MetaMask provider was not found.',
};

export async function connect({
  chainID,
}: MetamaskConnectParams): Promise<ethers.providers.Web3Provider> {
  const provider =
    (await detectEthereumProvider()) as ethers.providers.ExternalProvider;

  if (!provider?.request) {
    throw new Error(L1_METAMASK_ERRORS.PROVIDER_NOT_FOUND);
  }

  await provider.request({ method: WALLET_ACTION.CONNECT });

  if (chainID) {
    await provider.request({
      method: WALLET_ACTION.SWITCH_CHAIN,
      params: [{ chainId: `0x${chainID.toString(16)}` }],
    });
  }

  // NOTE: do we need to listen to events so we can await the user actions?

  return new ethers.providers.Web3Provider(provider);
}

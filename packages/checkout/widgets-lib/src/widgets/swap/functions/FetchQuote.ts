import {
  Exchange, deprecated,
} from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from '@imtbl/checkout-sdk';

const fromAmountIn = async (
  exchange: Exchange,
  provider: Web3Provider,
  fromToken: TokenInfo,
  fromAmount: string,
  toToken: TokenInfo,
): Promise<deprecated.TransactionResponse> => {
  const address = await provider.getSigner().getAddress();
  return exchange.getLegacyUnsignedSwapTxFromAmountIn(
    address,
    fromToken.address || '',
    toToken.address || '',
    BigNumber.from(utils.parseUnits(fromAmount, fromToken.decimals)),
  );
};

const fromAmountOut = async (
  exchange: Exchange,
  provider: Web3Provider,
  toToken: TokenInfo,
  toAmount: string,
  fromToken: TokenInfo,
): Promise<deprecated.TransactionResponse> => {
  const address = await provider.getSigner().getAddress();
  return exchange.getLegacyUnsignedSwapTxFromAmountOut(
    address,
    fromToken.address || '',
    toToken.address || '',
    BigNumber.from(utils.parseUnits(toAmount, toToken.decimals)),
  );
};

export const quotesProcessor = {
  fromAmountIn,
  fromAmountOut,
};

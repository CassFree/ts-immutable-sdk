/* eslint-disable max-len */
import {
  Trade, encodeRouteToPath, Route, toHex,
} from '@uniswap/v3-sdk';
import { SwapRouter } from '@uniswap/router-sdk';
import { Token, Percent, TradeType } from '@uniswap/sdk-core';
import { SecondaryFee__factory } from 'contracts/types';
import { ISecondaryFee, SecondaryFeeInterface } from 'contracts/types/SecondaryFee';
import { Fees } from 'lib/fees';
import { toCurrencyAmount } from 'lib/utils';
import { QuoteResult } from 'lib/getQuotesForRoutes';
import { TokenWrapper } from 'lib/tokenWrapper';
import {
  Native, SecondaryFee, Amount, TransactionDetails,
} from '../../types';
import { calculateGasFee } from './gas';
import { slippageToFraction } from './slippage';

type SwapOptions = {
  slippageTolerance: Percent;
  deadlineOrPreviousBlockhash: number;
  recipient: string;
};

const zeroNativeCurrencyValue = '0x00';
const multicallWithDeadlineFunctionSignature = 'multicall(uint256,bytes[])';

function buildSwapParametersForSinglePoolSwap(
  fromAddress: string,
  trade: Trade<Token, Token, TradeType>,
  route: Route<Token, Token>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const secondaryFeeValues: ISecondaryFee.SecondaryFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feeBasisPoints: fee.basisPoints,
    recipient: fee.recipient,
  }));

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return secondaryFeeContract.encodeFunctionData('exactInputSingleWithSecondaryFee', [
      secondaryFeeValues,
      {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: route.pools[0].fee,
        recipient: fromAddress,
        amountIn,
        amountOutMinimum: amountOut,
        sqrtPriceLimitX96: 0,
      },
    ]);
  }

  return secondaryFeeContract.encodeFunctionData('exactOutputSingleWithSecondaryFee', [
    secondaryFeeValues,
    {
      tokenIn: route.tokenPath[0].address,
      tokenOut: route.tokenPath[1].address,
      fee: route.pools[0].fee,
      recipient: fromAddress,
      amountInMaximum: amountIn,
      amountOut,
      sqrtPriceLimitX96: 0,
    },
  ]);
}

function buildSwapParametersForMultiPoolSwap(
  fromAddress: string,
  trade: Trade<Token, Token, TradeType>,
  route: Route<Token, Token>,
  amountIn: string,
  amountOut: string,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  const path: string = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT);

  const secondaryFeeValues: ISecondaryFee.SecondaryFeeParamsStruct[] = secondaryFees.map((fee) => ({
    feeBasisPoints: fee.basisPoints,
    recipient: fee.recipient,
  }));

  if (trade.tradeType === TradeType.EXACT_INPUT) {
    return secondaryFeeContract.encodeFunctionData('exactInputWithSecondaryFee', [
      secondaryFeeValues,
      {
        path,
        recipient: fromAddress,
        amountIn,
        amountOutMinimum: amountOut,
      },
    ]);
  }

  return secondaryFeeContract.encodeFunctionData('exactOutputWithSecondaryFee', [
    secondaryFeeValues,
    {
      path,
      recipient: fromAddress,
      amountInMaximum: amountIn,
      amountOut,
    },
  ]);
}

/**
 * Builds swap parameters
 * @param fromAddress the msg.sender of the transaction
 * @param secondaryFeeAddress the secondary fee contract address
 * @param trade details of the swap, including the route, input/output tokens and amounts
 * @param options additional swap options
 * @returns calldata for the swap
 */
function buildSwapParameters(
  fromAddress: string,
  trade: Trade<Token, Token, TradeType>,
  options: SwapOptions,
  secondaryFees: SecondaryFee[],
  secondaryFeeContract: SecondaryFeeInterface,
) {
  // @dev we don't support multiple swaps in a single transaction
  // there will always be only one swap in the trade regardless of the trade type
  const { route, inputAmount, outputAmount } = trade.swaps[0];
  const amountIn: string = toHex(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient);
  const amountOut: string = toHex(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient);

  const isSinglePoolSwap = route.pools.length === 1;

  if (isSinglePoolSwap) {
    return buildSwapParametersForSinglePoolSwap(
      fromAddress,
      trade,
      route,
      amountIn,
      amountOut,
      secondaryFees,
      secondaryFeeContract,
    );
  }

  return buildSwapParametersForMultiPoolSwap(
    fromAddress,
    trade,
    route,
    amountIn,
    amountOut,
    secondaryFees,
    secondaryFeeContract,
  );
}

function createSwapCallParametersWithFees(
  trade: Trade<Token, Token, TradeType>,
  fromAddress: string,
  swapOptions: SwapOptions,
  secondaryFees: SecondaryFee[],
): string {
  const secondaryFeeContract = SecondaryFee__factory.createInterface();

  const swapWithFeesCalldata = buildSwapParameters(
    fromAddress,
    trade,
    swapOptions,
    secondaryFees,
    secondaryFeeContract,
  );

  return secondaryFeeContract.encodeFunctionData(multicallWithDeadlineFunctionSignature, [
    swapOptions.deadlineOrPreviousBlockhash,
    [swapWithFeesCalldata],
  ]);
}

function createSwapParameters(
  adjustedQuote: QuoteResult,
  fromAddress: string,
  slippage: number,
  deadline: number,
  secondaryFees: SecondaryFee[],
): string {
  // Create an unchecked trade to be used in generating swap parameters.
  const uncheckedTrade = Trade.createUncheckedTrade({
    route: adjustedQuote.route,
    inputAmount: toCurrencyAmount(adjustedQuote.amountIn),
    outputAmount: toCurrencyAmount(adjustedQuote.amountOut),
    tradeType: adjustedQuote.tradeType,
  });

  const slippageTolerance = slippageToFraction(slippage);

  const options: SwapOptions = {
    slippageTolerance,
    recipient: fromAddress,
    deadlineOrPreviousBlockhash: deadline,
  };

  // TODO: Calculate amountIn and amountOut based on slippage tolerance and return it.

  if (secondaryFees.length === 0) {
    // Generate swap parameters without secondary fee contract details
    return SwapRouter.swapCallParameters([uncheckedTrade], options).calldata;
  }

  return createSwapCallParametersWithFees(uncheckedTrade, fromAddress, options, secondaryFees);
}

export function getSwap(
  adjustedQuote: QuoteResult,
  fromAddress: string,
  slippage: number,
  deadline: number,
  peripheryRouterAddress: string,
  secondaryFeesAddress: string,
  gasPrice: Amount<Native> | null,
  secondaryFees: SecondaryFee[],
): TransactionDetails {
  const calldata = createSwapParameters(adjustedQuote, fromAddress, slippage, deadline, secondaryFees);

  // TODO: Add additional gas fee estimates for secondary fees
  const gasFeeEstimate = gasPrice ? calculateGasFee(gasPrice, adjustedQuote.gasEstimate) : null;

  // TODO: Mirror the amountIn as the value for native swaps... taking into account slippage...

  return {
    transaction: {
      data: calldata,
      to: secondaryFees.length > 0 ? secondaryFeesAddress : peripheryRouterAddress,
      value: zeroNativeCurrencyValue, // we should never send the native currency to the router for a swap
      from: fromAddress,
    },
    gasFeeEstimate,
  };
}

export function adjustQuoteWithFees(
  ourQuote: QuoteResult,
  fees: Fees,
  tokenWrapper: TokenWrapper,
): QuoteResult {
  if (ourQuote.tradeType === TradeType.EXACT_OUTPUT) {
    // when doing exact output, calculate the fees based on the amountIn
    const amountToAdd = tokenWrapper.isNativeToken(fees.token) ? tokenWrapper.unwrapAmount(ourQuote.amountIn) : ourQuote.amountIn;
    fees.addAmount(amountToAdd);

    return {
      gasEstimate: ourQuote.gasEstimate,
      route: ourQuote.route,
      amountIn: tokenWrapper.maybeWrapAmount(fees.amountWithFeesApplied()),
      amountOut: ourQuote.amountOut,
      tradeType: ourQuote.tradeType,
    };
  }

  return ourQuote;
}

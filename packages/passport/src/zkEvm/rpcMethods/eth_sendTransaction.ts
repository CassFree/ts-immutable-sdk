import {
  TransactionRequest,
  Web3Provider,
} from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getNonce, getSignedSequenceTransactions } from '../sequence';
import { Transaction } from '../types';
import { EthMethodWithAuthParams } from './types';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';

export const ethSendTransaction = async ({
  params,
  magicProvider,
  jsonRpcProvider,
  relayerAdapter,
  config,
  user,
}: EthMethodWithAuthParams): Promise<string> => {
  const transactionRequest: TransactionRequest = params[0];
  if (!transactionRequest.to) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "to" field');
  }
  if (!transactionRequest.data) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "data" field');
  }

  const chainId = BigNumber.from(config.zkEvmChainId);
  const magicWeb3Provider = new Web3Provider(magicProvider);
  const signer = magicWeb3Provider.getSigner();

  const nonce = await getNonce(jsonRpcProvider, user.etherKey);
  const sequenceTransaction: Transaction = {
    to: transactionRequest.to,
    data: transactionRequest.data,
    nonce,
    value: transactionRequest.value,
    revertOnError: true,
  };

  const signedTransaction = await getSignedSequenceTransactions(
    [sequenceTransaction],
    nonce,
    chainId,
    user.etherKey,
    signer,
  );

  // TODO: ID-698 Add support for non-native gas payments (e.g ERC20, feeTransaction initialisation must change)
  const feeOptions = await relayerAdapter.imGetFeeOptions(user.etherKey, signedTransaction);
  const imxFeeOption = feeOptions.find((feeOption) => feeOption.tokenSymbol === 'IMX');
  if (!imxFeeOption) {
    throw new Error('Failed to retrieve fees for IMX token');
  }

  const sequenceFeeTransaction: Transaction = {
    nonce,
    to: imxFeeOption.recipientAddress,
    value: imxFeeOption.tokenPrice,
    revertOnError: true,
  };

  const signedTransactions = await getSignedSequenceTransactions(
    [sequenceTransaction, sequenceFeeTransaction],
    nonce,
    chainId,
    user.etherKey,
    signer,
  );

  // TODO: ID-697 Evaluate transactions through Guardian

  const transactionHash = await relayerAdapter.ethSendTransaction(transactionRequest.to, signedTransactions);

  const relayerTransaction = await relayerAdapter.imGetTransactionByHash(transactionHash);
  return relayerTransaction.hash;
};
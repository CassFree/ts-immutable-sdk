import { BigNumberish, BytesLike } from 'ethers';
import { JsonRpcError } from './JsonRpcError';

export interface RelayerTransaction {
  status: 'PENDING' | 'SUBMITTED' | 'SUCCESSFUL' | 'ERROR';
  chainId: string;
  relayerId: string;
  hash: string;
}

export interface FeeOption {
  tokenPrice: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  recipientAddress: string;
}

export interface Transaction {
  to: string
  value?: BigNumberish
  data?: BytesLike
  nonce?: BigNumberish
  gasLimit?: BigNumberish
  delegateCall?: boolean
  revertOnError?: boolean
}

export interface TransactionNormalised {
  delegateCall: boolean
  revertOnError: boolean
  gasLimit: BigNumberish
  target: string
  value: BigNumberish
  data: BytesLike
}

export interface RequestArguments<TParams = any> {
  method: string;
  params?: TParams;
}

export type JsonRpcRequestPayload = RequestArguments & {
  jsonrpc: string;
  id: string | number | null;
};

export interface JsonRpcRequestCallback {
  (err: JsonRpcError | null, result?: JsonRpcResponsePayload | null): void;
}
export interface JsonRpcResponsePayload<ResultType = any> {
  jsonrpc: string;
  id: string | number | null;
  result?: ResultType | null;
  error?: JsonRpcError | null;
}
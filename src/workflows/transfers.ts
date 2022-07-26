import {
  TransfersApi,
  GetSignableTransferRequest,
  GetSignableTransferRequestV1,
  CreateTransferResponse,
  CreateTransferResponseV1,
} from '../api';
import { WalletConnection } from '../types';
import { signRaw } from '../utils';

type TransfersWorkflowParams = WalletConnection & {
  request: GetSignableTransferRequestV1;
  transfersApi: TransfersApi;
};
type BatchTransfersWorkflowParams = WalletConnection & {
  request: GetSignableTransferRequest;
  transfersApi: TransfersApi;
};

export async function transfersWorkflow({
  l1Signer,
  l2Signer,
  request,
  transfersApi,
}: TransfersWorkflowParams): Promise<CreateTransferResponseV1> {
  const signableResult = await transfersApi.getSignableTransferV1({
    getSignableTransferRequest: {
      sender: request.sender,
      token: request.token,
      amount: request.amount,
      receiver: request.receiver,
    },
  });

  const { signable_message: signableMessage, payload_hash: payloadHash } =
    signableResult.data;

  const ethSignature = await signRaw(signableMessage, l1Signer);

  const starkSignature = await l2Signer.signMessage(payloadHash);

  const ethAddress = await l1Signer.getAddress();

  const transferSigningParams = {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sender_stark_key: signableResult.data.sender_stark_key!,
    sender_vault_id: signableResult.data.sender_vault_id,
    receiver_stark_key: signableResult.data.receiver_stark_key,
    receiver_vault_id: signableResult.data.receiver_vault_id,
    asset_id: signableResult.data.asset_id,
    amount: signableResult.data.amount,
    nonce: signableResult.data.nonce,
    expiration_timestamp: signableResult.data.expiration_timestamp,
    stark_signature: starkSignature,
  };

  const response = await transfersApi.createTransferV1({
    createTransferRequest: transferSigningParams,
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    sent_signature: response?.data.sent_signature,
    status: response?.data.status?.toString(),
    time: response?.data.time,
    transfer_id: response?.data.transfer_id,
  };
}

export async function batchTransfersWorkflow({
  l1Signer,
  l2Signer,
  request,
  transfersApi,
}: BatchTransfersWorkflowParams): Promise<CreateTransferResponse> {
  const signableResult = await transfersApi.getSignableTransfer({
    getSignableTransferRequestV2: {
      sender_ether_key: request.sender_ether_key,
      signable_requests: request.signable_requests,
    },
  });

  const signableMessage = signableResult.data.signable_message;

  if (signableMessage === undefined) {
    throw new Error('Invalid response from Signable registration offchain');
  }

  const ethAddress = await l1Signer.getAddress();

  const ethSignature = await signRaw(signableMessage, l1Signer);

  const requests = [];
  for (const resp of signableResult.data.signable_responses) {
    const starkSignature = await l2Signer.signMessage(resp.payload_hash);
    const req = {
      sender_vault_id: resp.sender_vault_id,
      receiver_stark_key: resp.receiver_stark_key,
      receiver_vault_id: resp.receiver_vault_id,
      asset_id: resp.asset_id,
      amount: resp.amount,
      nonce: resp.nonce,
      expiration_timestamp: resp.expiration_timestamp,
      stark_signature: starkSignature,
    };
    requests.push(req);
  }

  // TODO: throw error on missing payload hash?
  const transferSigningParams = {
    sender_stark_key: signableResult.data.sender_stark_key,
    requests,
  };

  const response = await transfersApi.createTransfer({
    createTransferRequestV2: transferSigningParams,
    xImxEthAddress: ethAddress,
    xImxEthSignature: ethSignature,
  });

  return {
    transfer_ids: response?.data.transfer_ids,
  };
}

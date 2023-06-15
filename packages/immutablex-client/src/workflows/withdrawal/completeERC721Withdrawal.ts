/* eslint-disable @typescript-eslint/naming-convention */
import { Signer } from '@ethersproject/abstract-signer';
import * as encUtils from 'enc-utils';
import { TransactionResponse } from '@ethersproject/providers';
import { EncodingApi, MintsApi, UsersApi } from '@imtbl/generated-clients/src/imx';
import {
  Core,
  Core__factory,
  Registration,
  Registration__factory,
} from '@imtbl/contracts';
import { ERC721Token } from '../../types';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChainWorkflow,
} from '../registration';
import { ImmutableXConfiguration } from '../../config';

interface MintableERC721Withdrawal {
  type: 'ERC721';
  data: {
    id: string;
    blueprint?: string;
    tokenAddress: string;
  };
}

async function executeWithdrawMintableERC721(
  signer: Signer,
  assetType: string,
  starkPublicKey: string,
  mintingBlob: string,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction.withdrawAndMint(
    starkPublicKey,
    assetType,
    mintingBlob,
  );
  return signer.sendTransaction(populatedTransaction);
}

async function executeRegisterAndWithdrawMintableERC721(
  signer: Signer,
  assetType: string,
  starkPublicKey: string,
  mintingBlob: string,
  contract: Registration,
  usersApi: UsersApi,
): Promise<TransactionResponse> {
  const etherKey = await signer.getAddress();

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const populatedTransaction = await contract.populateTransaction.regsiterAndWithdrawAndMint(
    etherKey,
    starkPublicKey,
    signableResult.operator_signature,
    assetType,
    mintingBlob,
  );

  return signer.sendTransaction(populatedTransaction);
}

function getMintingBlob(token: MintableERC721Withdrawal): string {
  const { id } = token.data;
  const blueprint = token.data.blueprint || '';
  return encUtils.sanitizeHex(encUtils.utf8ToHex(`{${id}}:{${blueprint}}`));
}

async function completeMintableERC721Withdrawal(
  signer: Signer,
  starkPublicKey: string,
  token: MintableERC721Withdrawal,
  encodingApi: EncodingApi,
  usersApi: UsersApi,
  config: ImmutableXConfiguration,
) {
  const assetType = await getEncodeAssetInfo(
    'mintable-asset',
    'ERC721',
    encodingApi,
    {
      id: token.data.id,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_address: token.data.tokenAddress,
      ...(token.data.blueprint && { blueprint: token.data.blueprint }),
    },
  );
  const mintingBlob = getMintingBlob(token);

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const registrationContract = Registration__factory.connect(
    config.ethConfiguration.registrationContractAddress,
    signer,
  );

  const isRegistered = await isRegisteredOnChainWorkflow(
    starkPublicKey,
    registrationContract,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawMintableERC721(
      signer,
      assetType.asset_type,
      starkPublicKey,
      mintingBlob,
      registrationContract,
      usersApi,
    );
  }
  return executeWithdrawMintableERC721(
    signer,
    assetType.asset_type,
    starkPublicKey,
    mintingBlob,
    coreContract,
  );
}

async function executeRegisterAndWithdrawERC721(
  signer: Signer,
  assetType: string,
  starkPublicKey: string,
  tokenId: string,
  contract: Registration,
  usersApi: UsersApi,
): Promise<TransactionResponse> {
  const etherKey = await signer.getAddress();

  const signableResult = await getSignableRegistrationOnchain(
    etherKey,
    starkPublicKey,
    usersApi,
  );

  const populatedTransaction = await contract.populateTransaction.registerAndWithdrawNft(
    etherKey,
    starkPublicKey,
    signableResult.operator_signature,
    assetType,
    tokenId,
  );

  return signer.sendTransaction(populatedTransaction);
}

async function executeWithdrawERC721(
  signer: Signer,
  assetType: string,
  starkPublicKey: string,
  tokenId: string,
  contract: Core,
): Promise<TransactionResponse> {
  const populatedTransaction = await contract.populateTransaction.withdrawNft(
    starkPublicKey,
    assetType,
    tokenId,
  );
  return signer.sendTransaction(populatedTransaction);
}

async function completeERC721Withdrawal(
  signer: Signer,
  starkPublicKey: string,
  token: ERC721Token,
  encodingApi: EncodingApi,
  usersApi: UsersApi,
  config: ImmutableXConfiguration,
) {
  const assetType = await getEncodeAssetInfo('asset', 'ERC721', encodingApi, {
    token_id: token.tokenId,
    token_address: token.tokenAddress,
  });

  const coreContract = Core__factory.connect(
    config.ethConfiguration.coreContractAddress,
    signer,
  );

  const registrationContract = Registration__factory.connect(
    config.ethConfiguration.registrationContractAddress,
    signer,
  );

  const isRegistered = await isRegisteredOnChainWorkflow(
    starkPublicKey,
    registrationContract,
  );

  if (!isRegistered) {
    return executeRegisterAndWithdrawERC721(
      signer,
      assetType.asset_type,
      starkPublicKey,
      token.tokenId,
      registrationContract,
      usersApi,
    );
  }
  return executeWithdrawERC721(
    signer,
    assetType.asset_type,
    starkPublicKey,
    token.tokenId,
    coreContract,
  );
}

export async function completeERC721WithdrawalWorkflow(
  signer: Signer,
  starkPublicKey: string,
  token: ERC721Token,
  encodingApi: EncodingApi,
  mintsApi: MintsApi,
  usersApi: UsersApi,
  config: ImmutableXConfiguration,
) {
  const { tokenAddress } = token;
  const { tokenId } = token;
  return await mintsApi
    .getMintableTokenDetailsByClientTokenId({
      tokenAddress,
      tokenId,
    })
    .then((mintableToken) => completeMintableERC721Withdrawal(
      signer,
      starkPublicKey,
      {
        type: 'ERC721',
        data: {
          id: tokenId,
          tokenAddress,
          blueprint: mintableToken.data.blueprint,
        },
      },
      encodingApi,
      usersApi,
      config,
    ))
    .catch((error) => {
      if (error.response?.status === 404) {
        // token is already minted on L1
        return completeERC721Withdrawal(
          signer,
          starkPublicKey,
          token,
          encodingApi,
          usersApi,
          config,
        );
      }
      throw error; // unable to recover from any other kind of error
    });
}
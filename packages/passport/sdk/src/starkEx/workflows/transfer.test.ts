import { TransfersApi, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { PassportError, PassportErrorType } from '../../errors/passportError';
import { mockErrorMessage, mockStarkSignature, mockUserImx } from '../../test/mocks';
import { batchNftTransfer, transfer } from './transfer';
import GuardianClient from '../guardian';

jest.mock('../guardian');

describe('transfer', () => {
  afterEach(jest.resetAllMocks);

  const mockStarkSigner = {
    signMessage: jest.fn(),
    getAddress: jest.fn(),
  };

  describe('single transfer', () => {
    let getSignableTransferV1Mock: jest.Mock;
    let createTransferV1Mock: jest.Mock;
    let transferApiMock: TransfersApi;

    const mockReceiver = 'AAA';
    const type = 'ERC721';
    const tokenId = '111';
    const tokenAddress = '0x1234';
    const mockTransferRequest = {
      type,
      tokenId,
      tokenAddress,
      receiver: mockReceiver,
    };
    const mockGuardianClient = new GuardianClient({} as any);

    beforeEach(() => {
      getSignableTransferV1Mock = jest.fn();
      createTransferV1Mock = jest.fn();
      transferApiMock = {
        getSignableTransferV1: getSignableTransferV1Mock,
        createTransferV1: createTransferV1Mock,
      } as unknown as TransfersApi;
    });

    it('should returns success transfer result', async () => {
      const mockSignableTransferRequest = {
        getSignableTransferRequest: {
          amount: '1',
          receiver: mockReceiver,
          sender: mockUserImx.imx.ethAddress,
          token: {
            data: { token_address: tokenAddress, token_id: tokenId },
            type,
          },
        },
      };
      const mockSignableTransferV1Response = {
        data: {
          payload_hash: '123123',
          sender_stark_key: 'starkKey',
          sender_vault_id: '111',
          receiver_stark_key: 'starkKey2',
          receiver_vault_id: '222',
          asset_id: tokenId,
          amount: '1',
          nonce: '5321',
          expiration_timestamp: '1234',
        },
      };
      const {
        payload_hash: mockPayloadHash,
        ...restSignableTransferV1Response
      } = mockSignableTransferV1Response.data;
      const mockCreateTransferRequest = {
        createTransferRequest: {
          ...restSignableTransferV1Response,
          stark_signature: mockStarkSignature,
        },
      };
      const mockHeader = {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${mockUserImx.accessToken}`,
        },
      };
      const mockReturnValue = {
        sent_signature: '0x1c8aff950685c2ed4bc3174f3472287b56d95',
        status: 'success',
        time: 111,
        transfer_id: 123,
      };

      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response,
      );
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferV1Mock.mockResolvedValue({
        data: mockReturnValue,
      });

      const result = await transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockTransferRequest as UnsignedTransferRequest,
        guardianClient: mockGuardianClient,
      });

      expect(mockGuardianClient.loading).toBeCalled();
      expect(getSignableTransferV1Mock).toBeCalledWith(mockSignableTransferRequest, mockHeader);
      expect(mockStarkSigner.signMessage).toBeCalledWith(mockPayloadHash);
      expect(mockGuardianClient.validate).toBeCalledWith({ payloadHash: mockPayloadHash });
      expect(createTransferV1Mock).toBeCalledWith(
        mockCreateTransferRequest,
        mockHeader,
      );
      expect(result).toEqual(mockReturnValue);
    });

    it('should return error if failed to call public api', async () => {
      getSignableTransferV1Mock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockTransferRequest as UnsignedTransferRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.TRANSFER_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.TRANSFER_ERROR,
        ),
      );
    });

    it('should return error if transfer is rejected by user', async () => {
      const mockSignableTransferV1Response = {
        data: {
          payload_hash: '123123',
          sender_stark_key: 'starkKey',
          sender_vault_id: '111',
          receiver_stark_key: 'starkKey2',
          receiver_vault_id: '222',
          asset_id: tokenId,
          amount: '1',
          nonce: '5321',
          expiration_timestamp: '1234',
        },
      };
      getSignableTransferV1Mock.mockResolvedValue(
        mockSignableTransferV1Response,
      );

      (mockGuardianClient.validate as jest.Mock).mockRejectedValue(new Error('Transaction rejected by user'));
      await expect(() => transfer({
        transfersApi: transferApiMock,
        starkSigner: mockStarkSigner,
        user: mockUserImx,
        request: mockTransferRequest as UnsignedTransferRequest,
        guardianClient: mockGuardianClient,
      })).rejects.toThrowError('TRANSFER_ERROR');
    });
  });

  describe('batchNftTransfer', () => {
    let getSignableTransferMock: jest.Mock;
    let createTransferMock: jest.Mock;
    let transferApiMock: TransfersApi;
    const mockGuardianClient = new GuardianClient({} as any);

    const transferRequest = [
      {
        tokenId: '1',
        tokenAddress: 'token_address',
        receiver: 'receiver_eth_address',
      },
    ];

    const popupOptions = {
      height: 784,
      width: 480,
    };

    beforeEach(() => {
      getSignableTransferMock = jest.fn();
      createTransferMock = jest.fn();
      transferApiMock = {
        getSignableTransfer: getSignableTransferMock,
        createTransfer: createTransferMock,
      } as unknown as TransfersApi;
    });

    it('should make a successful batch transfer request', async () => {
      const mockTransferResponse = {
        data: {
          transfer_ids: ['transfer_id_1'],
        },
      };
      const sender_stark_key = 'sender_stark_key';
      const sender_vault_id = 'sender_vault_id';
      const receiver_stark_key = 'receiver_stark_key';
      const receiver_vault_id = 'receiver_vault_id';
      const asset_id = 'asset_id';
      const amount = 'amount';
      const nonce = 'nonce';
      const expiration_timestamp = 'expiration_timestamp';
      const payload_hash = 'payload_hash';
      const mockSignableTransferResponse = {
        data: {
          sender_stark_key,
          signable_responses: [
            {
              sender_vault_id,
              receiver_stark_key,
              receiver_vault_id,
              asset_id,
              amount,
              nonce,
              expiration_timestamp,
              payload_hash,
            },
          ],
        },
      };
      const mockHeader = {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${mockUserImx.accessToken}`,
        },
      };

      getSignableTransferMock.mockResolvedValue(mockSignableTransferResponse);
      mockStarkSigner.signMessage.mockResolvedValue(mockStarkSignature);
      createTransferMock.mockResolvedValue(mockTransferResponse);

      const result = await batchNftTransfer({
        user: mockUserImx,
        starkSigner: mockStarkSigner,
        request: transferRequest,
        transfersApi: transferApiMock,
        guardianClient: mockGuardianClient,
      });

      expect(result).toEqual({
        transfer_ids: mockTransferResponse.data.transfer_ids,
      });
      expect(getSignableTransferMock).toHaveBeenCalledWith({
        getSignableTransferRequestV2: {
          sender_ether_key: mockUserImx.imx.ethAddress,
          signable_requests: [
            {
              amount: '1',
              token: {
                type: 'ERC721',
                data: {
                  token_id: transferRequest[0].tokenId,
                  token_address: transferRequest[0].tokenAddress,
                },
              },
              receiver: transferRequest[0].receiver,
            },
          ],
        },
      }, mockHeader);
      expect(mockStarkSigner.signMessage).toHaveBeenCalled();
      expect(mockGuardianClient.loading).toBeCalledWith(popupOptions);
      expect(mockGuardianClient.validate).toBeCalledWith({
        payloadHash: payload_hash,
      });
      expect(createTransferMock).toHaveBeenCalledWith(
        {
          createTransferRequestV2: {
            sender_stark_key,
            requests: [
              {
                sender_vault_id,
                receiver_stark_key,
                receiver_vault_id,
                asset_id,
                amount,
                nonce,
                expiration_timestamp,
                stark_signature: mockStarkSignature,
              },
            ],
          },
        },
        mockHeader,
      );
    });

    it('should return error if failed to call public api', async () => {
      getSignableTransferMock.mockRejectedValue(new Error(mockErrorMessage));

      await expect(() => batchNftTransfer({
        user: mockUserImx,
        starkSigner: mockStarkSigner,
        request: transferRequest,
        transfersApi: transferApiMock,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.TRANSFER_ERROR}: ${mockErrorMessage}`,
          PassportErrorType.TRANSFER_ERROR,
        ),
      );
    });

    it('should return error if transfer is rejected by user', async () => {
      const sender_stark_key = 'sender_stark_key';
      const sender_vault_id = 'sender_vault_id';
      const receiver_stark_key = 'receiver_stark_key';
      const receiver_vault_id = 'receiver_vault_id';
      const asset_id = 'asset_id';
      const amount = 'amount';
      const nonce = 'nonce';
      const expiration_timestamp = 'expiration_timestamp';
      const payload_hash = 'payload_hash';
      const mockSignableTransferResponse = {
        data: {
          sender_stark_key,
          signable_responses: [
            {
              sender_vault_id,
              receiver_stark_key,
              receiver_vault_id,
              asset_id,
              amount,
              nonce,
              expiration_timestamp,
              payload_hash,
            },
          ],
        },
      };
      getSignableTransferMock.mockResolvedValue(mockSignableTransferResponse);

      (mockGuardianClient.validate as jest.Mock).mockRejectedValue(new Error('Transaction rejected by user'));
      await expect(() => batchNftTransfer({
        user: mockUserImx,
        starkSigner: mockStarkSigner,
        request: transferRequest,
        transfersApi: transferApiMock,
        guardianClient: mockGuardianClient,
      })).rejects.toThrow(
        new PassportError(
          `${PassportErrorType.TRANSFER_ERROR}: Transaction rejected by user`,
          PassportErrorType.TRANSFER_ERROR,
        ),
      );
    });
  });
});
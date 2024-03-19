/* tslint:disable */
/* eslint-disable */
/**
 * Immutable zkEVM API
 * Immutable Multi Rollup API
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface ERC721ApproveMetadata
 */
export interface ERC721ApproveMetadata {
    /**
     * Transaction type
     * @type {string}
     * @memberof ERC721ApproveMetadata
     */
    'transaction_type': ERC721ApproveMetadataTransactionTypeEnum;
    /**
     * NFT Collection name
     * @type {string}
     * @memberof ERC721ApproveMetadata
     */
    'collection_name': string;
    /**
     * NFT Collection image
     * @type {string}
     * @memberof ERC721ApproveMetadata
     */
    'collection_image': string;
    /**
     * NFT Asset name
     * @type {string}
     * @memberof ERC721ApproveMetadata
     */
    'asset_image': string;
    /**
     * NFT Asset image
     * @type {string}
     * @memberof ERC721ApproveMetadata
     */
    'asset_name': string;
}

export const ERC721ApproveMetadataTransactionTypeEnum = {
    Erc721Approve: 'ERC721_APPROVE'
} as const;

export type ERC721ApproveMetadataTransactionTypeEnum = typeof ERC721ApproveMetadataTransactionTypeEnum[keyof typeof ERC721ApproveMetadataTransactionTypeEnum];


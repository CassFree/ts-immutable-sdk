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


// @ts-ignore
import { APIError400 } from '../models';
// @ts-ignore
import { APIError404 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { AssetVerificationStatus } from '../models';
// @ts-ignore
import { GetTokenResult } from '../models';
// @ts-ignore
import { ListTokensResult } from '../models';
// @ts-ignore
export { APIError400 } from '../models';
// @ts-ignore
export { APIError404 } from '../models';
// @ts-ignore
export { APIError500 } from '../models';
// @ts-ignore
export { AssetVerificationStatus } from '../models';
// @ts-ignore
export { GetTokenResult } from '../models';
// @ts-ignore
export { ListTokensResult } from '../models';

/**
 * Request parameters for getERC20Token operation in TokensApi.
 * @export
 * @interface GetERC20TokenRequest
 */
export interface GetERC20TokenRequestParams {
    /**
     * The address of contract
     * @type {string}
     * @memberof GetERC20Token
     */
    readonly contractAddress: string

    /**
     * The name of chain
     * @type {string}
     * @memberof GetERC20Token
     */
    readonly chainName: string
}

/**
 * Request parameters for listERC20Tokens operation in TokensApi.
 * @export
 * @interface ListERC20TokensRequest
 */
export interface ListERC20TokensRequestParams {
    /**
     * The name of chain
     * @type {string}
     * @memberof ListERC20Tokens
     */
    readonly chainName: string

    /**
     * Datetime to use as the oldest updated timestamp
     * @type {string}
     * @memberof ListERC20Tokens
     */
    readonly fromUpdatedAt?: string

    /**
     * List of verification status to filter by
     * @type {Array<AssetVerificationStatus>}
     * @memberof ListERC20Tokens
     */
    readonly verificationStatus?: Array<AssetVerificationStatus>

    /**
     * Encoded page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof ListERC20Tokens
     */
    readonly pageCursor?: string

    /**
     * Maximum number of items to return
     * @type {number}
     * @memberof ListERC20Tokens
     */
    readonly pageSize?: number
}



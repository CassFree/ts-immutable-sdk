/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable X API
 *
 * The version of the OpenAPI document: 3.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { RejectPrimarySaleOKBodyResultFeesItems } from './reject-primary-sale-okbody-result-fees-items';

/**
 * 
 * @export
 * @interface RejectPrimarySaleOKBodyResult
 */
export interface RejectPrimarySaleOKBodyResult {
    /**
     * Ethereum address of the buyer
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'buyer_ether_key': string;
    /**
     * Time the primary sale was created
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'created_at': string;
    /**
     * Time the primary sale expires
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'expires_at': string;
    /**
     * 
     * @type {Array<RejectPrimarySaleOKBodyResultFeesItems>}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'fees'?: Array<RejectPrimarySaleOKBodyResultFeesItems>;
    /**
     * Global Primary Sale identifier
     * @type {number}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'id': number;
    /**
     * Ethereum address of the items receiver
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'items_recipient_ether_key': string;
    /**
     * Fee inclusive amount of the transfer
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'payment_amount': string;
    /**
     * Ethereum address of the payment receiver
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'payment_recipient_ether_key': string;
    /**
     * 
     * @type {object}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'payment_token': object;
    /**
     * The primary sale status
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'status': RejectPrimarySaleOKBodyResultStatusEnum;
    /**
     * Arbitrary data defined by the selling party (e.g. game studio) to identify the primary sale. We suggest signing this payload to verify authenticity when processing.
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'studio_data': string;
    /**
     * Ethereum address of the studio operating the primary sale, will be used to verify in completion
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'studio_ether_key': string;
    /**
     * Time the primary sale was updated
     * @type {string}
     * @memberof RejectPrimarySaleOKBodyResult
     */
    'updated_at': string;
}

export const RejectPrimarySaleOKBodyResultStatusEnum = {
    Pending: 'PENDING',
    Active: 'ACTIVE',
    Invalid: 'INVALID',
    InProgress: 'IN_PROGRESS',
    Accepted: 'ACCEPTED',
    Failed: 'FAILED',
    Rejected: 'REJECTED',
    Expired: 'EXPIRED'
} as const;

export type RejectPrimarySaleOKBodyResultStatusEnum = typeof RejectPrimarySaleOKBodyResultStatusEnum[keyof typeof RejectPrimarySaleOKBodyResultStatusEnum];



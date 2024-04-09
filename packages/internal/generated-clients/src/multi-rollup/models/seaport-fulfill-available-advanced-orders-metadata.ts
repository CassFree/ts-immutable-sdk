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


// May contain unused imports in some cases
// @ts-ignore
import { SeaportAdvancedOrder } from './seaport-advanced-order';

/**
 * 
 * @export
 * @interface SeaportFulfillAvailableAdvancedOrdersMetadata
 */
export interface SeaportFulfillAvailableAdvancedOrdersMetadata {
    /**
     * Transaction type
     * @type {string}
     * @memberof SeaportFulfillAvailableAdvancedOrdersMetadata
     */
    'transaction_type': SeaportFulfillAvailableAdvancedOrdersMetadataTransactionTypeEnum;
    /**
     * 
     * @type {Array<SeaportAdvancedOrder>}
     * @memberof SeaportFulfillAvailableAdvancedOrdersMetadata
     */
    'orders'?: Array<SeaportAdvancedOrder>;
}

export const SeaportFulfillAvailableAdvancedOrdersMetadataTransactionTypeEnum = {
    SeaportFulfillAvailableAdvancedOrders: 'SEAPORT_FULFILL_AVAILABLE_ADVANCED_ORDERS'
} as const;

export type SeaportFulfillAvailableAdvancedOrdersMetadataTransactionTypeEnum = typeof SeaportFulfillAvailableAdvancedOrdersMetadataTransactionTypeEnum[keyof typeof SeaportFulfillAvailableAdvancedOrdersMetadataTransactionTypeEnum];


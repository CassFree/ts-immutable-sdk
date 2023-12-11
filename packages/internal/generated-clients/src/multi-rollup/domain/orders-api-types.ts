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
import { APIError401 } from '../models';
// @ts-ignore
import { APIError404 } from '../models';
// @ts-ignore
import { APIError429 } from '../models';
// @ts-ignore
import { APIError500 } from '../models';
// @ts-ignore
import { APIError501 } from '../models';
// @ts-ignore
import { CancelOrdersRequestBody } from '../models';
// @ts-ignore
import { CancelOrdersResult } from '../models';
// @ts-ignore
import { CreateListingRequestBody } from '../models';
// @ts-ignore
import { FulfillmentData200Response } from '../models';
// @ts-ignore
import { FulfillmentDataRequest } from '../models';
// @ts-ignore
import { ListListingsResult } from '../models';
// @ts-ignore
import { ListTradeResult } from '../models';
// @ts-ignore
import { ListingResult } from '../models';
// @ts-ignore
import { OrderStatusName } from '../models';
// @ts-ignore
import { TradeResult } from '../models';
// @ts-ignore
export { APIError400 } from '../models';
// @ts-ignore
export { APIError401 } from '../models';
// @ts-ignore
export { APIError404 } from '../models';
// @ts-ignore
export { APIError429 } from '../models';
// @ts-ignore
export { APIError500 } from '../models';
// @ts-ignore
export { APIError501 } from '../models';
// @ts-ignore
export { CancelOrdersRequestBody } from '../models';
// @ts-ignore
export { CancelOrdersResult } from '../models';
// @ts-ignore
export { CreateListingRequestBody } from '../models';
// @ts-ignore
export { FulfillmentData200Response } from '../models';
// @ts-ignore
export { FulfillmentDataRequest } from '../models';
// @ts-ignore
export { ListListingsResult } from '../models';
// @ts-ignore
export { ListTradeResult } from '../models';
// @ts-ignore
export { ListingResult } from '../models';
// @ts-ignore
export { OrderStatusName } from '../models';
// @ts-ignore
export { TradeResult } from '../models';

/**
 * Request parameters for cancelOrders operation in OrdersApi.
 * @export
 * @interface CancelOrdersRequest
 */
export interface CancelOrdersRequest {
    /**
     * 
     * @type {string}
     * @memberof CancelOrders
     */
    readonly chainName: string

    /**
     * 
     * @type {CancelOrdersRequestBody}
     * @memberof CancelOrders
     */
    readonly cancelOrdersRequestBody: CancelOrdersRequestBody
}

/**
 * Request parameters for createListing operation in OrdersApi.
 * @export
 * @interface CreateListingRequest
 */
export interface CreateListingRequest {
    /**
     * 
     * @type {string}
     * @memberof CreateListing
     */
    readonly chainName: string

    /**
     * 
     * @type {CreateListingRequestBody}
     * @memberof CreateListing
     */
    readonly createListingRequestBody: CreateListingRequestBody
}

/**
 * Request parameters for fulfillmentData operation in OrdersApi.
 * @export
 * @interface FulfillmentDataRequest
 */
export interface FulfillmentDataRequest {
    /**
     * 
     * @type {string}
     * @memberof FulfillmentData
     */
    readonly chainName: string

    /**
     * 
     * @type {Array<FulfillmentDataRequest>}
     * @memberof FulfillmentData
     */
    readonly fulfillmentDataRequest: Array<FulfillmentDataRequest>
}

/**
 * Request parameters for getListing operation in OrdersApi.
 * @export
 * @interface GetListingRequest
 */
export interface GetListingRequest {
    /**
     * 
     * @type {string}
     * @memberof GetListing
     */
    readonly chainName: string

    /**
     * Global Order identifier
     * @type {string}
     * @memberof GetListing
     */
    readonly listingId: string
}

/**
 * Request parameters for getTrade operation in OrdersApi.
 * @export
 * @interface GetTradeRequest
 */
export interface GetTradeRequest {
    /**
     * 
     * @type {string}
     * @memberof GetTrade
     */
    readonly chainName: string

    /**
     * Global Trade identifier
     * @type {string}
     * @memberof GetTrade
     */
    readonly tradeId: string
}

/**
 * Request parameters for listListings operation in OrdersApi.
 * @export
 * @interface ListListingsRequest
 */
export interface ListListingsRequest {
    /**
     * 
     * @type {string}
     * @memberof ListListings
     */
    readonly chainName: string

    /**
     * Order status to filter by
     * @type {OrderStatusName}
     * @memberof ListListings
     */
    readonly status?: OrderStatusName

    /**
     * Sell item contract address to filter by
     * @type {string}
     * @memberof ListListings
     */
    readonly sellItemContractAddress?: string

    /**
     * Buy item contract address to filter by
     * @type {string}
     * @memberof ListListings
     */
    readonly buyItemContractAddress?: string

    /**
     * The account address of the user who created the listing
     * @type {string}
     * @memberof ListListings
     */
    readonly accountAddress?: string

    /**
     * The metadata_id of the sell item
     * @type {string}
     * @memberof ListListings
     */
    readonly sellItemMetadataId?: string

    /**
     * Sell item token identifier to filter by
     * @type {string}
     * @memberof ListListings
     */
    readonly sellItemTokenId?: string

    /**
     * From updated at including given date
     * @type {string}
     * @memberof ListListings
     */
    readonly fromUpdatedAt?: string

    /**
     * Maximum number of orders to return per page
     * @type {number}
     * @memberof ListListings
     */
    readonly pageSize?: number

    /**
     * Order field to sort by
     * @type {'created_at' | 'updated_at' | 'buy_item_amount'}
     * @memberof ListListings
     */
    readonly sortBy?: ListListingsSortByEnum

    /**
     * Ascending or descending direction for sort
     * @type {'asc' | 'desc'}
     * @memberof ListListings
     */
    readonly sortDirection?: ListListingsSortDirectionEnum

    /**
     * Page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof ListListings
     */
    readonly pageCursor?: string
}

/**
 * Request parameters for listTrades operation in OrdersApi.
 * @export
 * @interface ListTradesRequest
 */
export interface ListTradesRequest {
    /**
     * 
     * @type {string}
     * @memberof ListTrades
     */
    readonly chainName: string

    /**
     * 
     * @type {string}
     * @memberof ListTrades
     */
    readonly accountAddress?: string

    /**
     * From indexed at including given date
     * @type {string}
     * @memberof ListTrades
     */
    readonly fromIndexedAt?: string

    /**
     * Maximum number of trades to return per page
     * @type {number}
     * @memberof ListTrades
     */
    readonly pageSize?: number

    /**
     * Trade field to sort by
     * @type {'indexed_at'}
     * @memberof ListTrades
     */
    readonly sortBy?: ListTradesSortByEnum

    /**
     * Ascending or descending direction for sort
     * @type {'asc' | 'desc'}
     * @memberof ListTrades
     */
    readonly sortDirection?: ListTradesSortDirectionEnum

    /**
     * Page cursor to retrieve previous or next page. Use the value returned in the response.
     * @type {string}
     * @memberof ListTrades
     */
    readonly pageCursor?: string
}


/**
 * @export
 */
export const ListListingsSortByEnum = {
    CreatedAt: 'created_at',
    UpdatedAt: 'updated_at',
    BuyItemAmount: 'buy_item_amount'
} as const;
export type ListListingsSortByEnum = typeof ListListingsSortByEnum[keyof typeof ListListingsSortByEnum];
/**
 * @export
 */
export const ListListingsSortDirectionEnum = {
    Asc: 'asc',
    Desc: 'desc'
} as const;
export type ListListingsSortDirectionEnum = typeof ListListingsSortDirectionEnum[keyof typeof ListListingsSortDirectionEnum];
/**
 * @export
 */
export const ListTradesSortByEnum = {
    IndexedAt: 'indexed_at'
} as const;
export type ListTradesSortByEnum = typeof ListTradesSortByEnum[keyof typeof ListTradesSortByEnum];
/**
 * @export
 */
export const ListTradesSortDirectionEnum = {
    Asc: 'asc',
    Desc: 'desc'
} as const;
export type ListTradesSortDirectionEnum = typeof ListTradesSortDirectionEnum[keyof typeof ListTradesSortDirectionEnum];

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
import { ActivityDetails } from './activity-details';
// May contain unused imports in some cases
// @ts-ignore
import { ActivityType } from './activity-type';
// May contain unused imports in some cases
// @ts-ignore
import { BlockchainMetadata } from './blockchain-metadata';
// May contain unused imports in some cases
// @ts-ignore
import { Chain } from './chain';

/**
 * 
 * @export
 * @interface Activity
 */
export interface Activity {
    /**
     * Activity id in UUIDv4 format
     * @type {string}
     * @memberof Activity
     */
    'id': string;
    /**
     * 
     * @type {Chain}
     * @memberof Activity
     */
    'chain': Chain;
    /**
     * 
     * @type {ActivityType}
     * @memberof Activity
     */
    'type': ActivityType;
    /**
     * 
     * @type {ActivityDetails}
     * @memberof Activity
     */
    'details': ActivityDetails;
    /**
     * The time activity was updated at
     * @type {string}
     * @memberof Activity
     */
    'updated_at': string;
    /**
     * The time activity was indexed
     * @type {string}
     * @memberof Activity
     */
    'indexed_at': string;
    /**
     * 
     * @type {BlockchainMetadata}
     * @memberof Activity
     */
    'blockchain_metadata': BlockchainMetadata | null;
}




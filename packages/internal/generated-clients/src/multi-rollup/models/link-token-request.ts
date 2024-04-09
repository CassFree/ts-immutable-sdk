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
 * @interface LinkTokenRequest
 */
export interface LinkTokenRequest {
    /**
     * String created by signing wallet address and timestamp
     * @type {string}
     * @memberof LinkTokenRequest
     */
    'signature': string;
    /**
     * The address of the contract
     * @type {string}
     * @memberof LinkTokenRequest
     */
    'contract_address': string;
    /**
     * The name of environment
     * @type {string}
     * @memberof LinkTokenRequest
     */
    'environment_name': string;
}


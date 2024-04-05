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
 * @interface SeaportERC20Item
 */
export interface SeaportERC20Item {
    /**
     * Token type user is offering, which in this case is ERC20
     * @type {string}
     * @memberof SeaportERC20Item
     */
    'type': SeaportERC20ItemTypeEnum;
    /**
     * Address of ERC20 token
     * @type {string}
     * @memberof SeaportERC20Item
     */
    'contract_address': string;
    /**
     * The symbol of token
     * @type {string}
     * @memberof SeaportERC20Item
     */
    'symbol'?: string | null;
    /**
     * The image url of token
     * @type {string}
     * @memberof SeaportERC20Item
     */
    'image_url'?: string | null;
    /**
     * A string representing the price at which the user is willing to sell the token
     * @type {string}
     * @memberof SeaportERC20Item
     */
    'amount': string;
    /**
     * The decimal of this erc20 item
     * @type {number}
     * @memberof SeaportERC20Item
     */
    'decimals': number;
}

export const SeaportERC20ItemTypeEnum = {
    Erc20: 'ERC20'
} as const;

export type SeaportERC20ItemTypeEnum = typeof SeaportERC20ItemTypeEnum[keyof typeof SeaportERC20ItemTypeEnum];



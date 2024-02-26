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



/**
 * 
 * @export
 * @interface CreatePrimarySaleUnauthorizedBodyAllOf1
 */
export interface CreatePrimarySaleUnauthorizedBodyAllOf1 {
    /**
     * Error Code
     * @type {string}
     * @memberof CreatePrimarySaleUnauthorizedBodyAllOf1
     */
    'code': CreatePrimarySaleUnauthorizedBodyAllOf1CodeEnum;
    /**
     * Additional details to help resolve the error
     * @type {object}
     * @memberof CreatePrimarySaleUnauthorizedBodyAllOf1
     */
    'details': object | null;
}

export const CreatePrimarySaleUnauthorizedBodyAllOf1CodeEnum = {
    UnauthorisedRequest: 'UNAUTHORISED_REQUEST'
} as const;

export type CreatePrimarySaleUnauthorizedBodyAllOf1CodeEnum = typeof CreatePrimarySaleUnauthorizedBodyAllOf1CodeEnum[keyof typeof CreatePrimarySaleUnauthorizedBodyAllOf1CodeEnum];


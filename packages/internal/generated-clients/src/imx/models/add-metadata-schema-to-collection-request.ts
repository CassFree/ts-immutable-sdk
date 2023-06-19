/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { MetadataSchemaRequest } from './metadata-schema-request';

/**
 * 
 * @export
 * @interface AddMetadataSchemaToCollectionRequest
 */
export interface AddMetadataSchemaToCollectionRequest {
    /**
     * Not required from API user
     * @type {string}
     * @memberof AddMetadataSchemaToCollectionRequest
     */
    'contract_address'?: string;
    /**
     * The metadata container
     * @type {Array<MetadataSchemaRequest>}
     * @memberof AddMetadataSchemaToCollectionRequest
     */
    'metadata': Array<MetadataSchemaRequest>;
}


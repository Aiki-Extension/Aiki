/**
 * module that generates a uuid with the help of the npm package.
 * @module UUIDGenerator
 */

import * as uuid from 'uuid'

/**
 * Generates a UUID using the uuid npm package
 * @returns {string} UUID in string format
 * @method generateUUID
 */
export function generateUUID() {
    return uuid.v1();
}
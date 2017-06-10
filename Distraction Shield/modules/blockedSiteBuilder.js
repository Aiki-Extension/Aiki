
/**
 * This module is a utility used to construct and initialize instances of the BlockedSite class. This module is the
 * only right way of creating a new BlockedSiteItem.
 * @module blockedSiteBuilder
 */

import {getUrlFromServer} from "./urlFormatter"
import BlockedSite from "../classes/BlockedSite"
import {addBlockedSiteToStorage} from "./storage/storageModifier"

/**
 * Constructs a new blockedSite instance using the given url, and passes it on using a promise
 * The only real right way of creating a new blocked site. For this it uses the BlockedSite and the urlFormatter.
 * It also adds it to the current list of blockedSites.
 * @param {string} newUrl the unformatted url of which to construct a BlockedSite
 * @method createNewBlockedSite
 */
export function createNewBlockedSite(newUrl) {
    return new Promise((resolve, reject) => {
        getUrlFromServer(newUrl, (url, title) => {
            let blockedSite = new BlockedSite(url, title);
            resolve(blockedSite);
        }, (errorMessage) => { reject(errorMessage); });
    });
}

/**
 * constructs a new BlockedSite and instantly adds it to the storage as well
 * @param {string} newUrl the unformatted url of which to construct a BlockedSite
 * @method createBlockedSiteAndAddToStorage
 */
export function createBlockedSiteAndAddToStorage(newUrl) {
    return new Promise((resolve, reject) => {
        createNewBlockedSite(newUrl)
            .then((blockedSite) => {
                return addBlockedSiteToStorage(blockedSite)
                    .catch(error => {
                        reject(error)
                    })
            })
            .catch(error => {
                reject(error)
            });
    });
}

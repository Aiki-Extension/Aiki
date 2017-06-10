import * as constants from '../../constants'
import {getBlacklistPromise, setBlacklist} from './storage'
import {logToFile} from '../../modules/logger'

/**
 * This module is used for changing stuff inside the storage. This is used for getting, updating and setting
 * data that is supposed to be in the storage. mostly a matter of storage.get -> setData -> storage.set
 * @module storageModifier
 */


/* ----------------  BlockedSiteList/Blacklist Modifications --------------- */

/**
 *
 * @param {BlockedSite} blocked_site The item we want to add to our {@link BlockedSiteList} in the storage
 * @returns {Promise} Promise that is either resolved or rejected. If rejected passes the type of error. (catch with Promise.catch)
 * @method addBlockedSiteToStorage
 */
export function addBlockedSiteToStorage(blocked_site) {
    return getBlacklistPromise().then(blockedSiteList => {
        if (blockedSiteList.addToList(blocked_site)){
            logToFile(constants.logEventType.changed, blocked_site.name,'added', constants.logType.settings);
            return setBlacklist(blockedSiteList);
        } else
            return Promise.reject(constants.newUrlNotUniqueError + blocked_site.domain);
    });
}

/**
 *
 * @param {BlockedSite} blocked_site The item we want to remove from our {@link BlockedSiteList} in the storage
 * @returns {Promise} Promise that is either resolved or rejected. If rejected passes the type of error. (catch with Promise.catch)
 * @method removeBlockedSiteFromStorage
 */
export function removeBlockedSiteFromStorage(blocked_site) {
    return getBlacklistPromise().then(blockedSiteList => {
        blockedSiteList.removeFromList(blocked_site);
        logToFile(constants.logEventType.changed, blocked_site.name, 'removed', constants.logType.settings);
        return setBlacklist(blockedSiteList);
    });
}

/**
 *
 * @param {BlockedSite} blocked_site The item we want to add to update in our {@link BlockedSiteList} in the storage
 * @returns {Promise} Promise that is either resolved or rejected. If rejected passes the type of error. (catch with Promise.catch)
 * @method updateBlockedSiteInStorage
 */
export function updateBlockedSiteInStorage(blocked_site) {
    return getBlacklistPromise().then(blockedSiteList => {
        blockedSiteList.updateInList(blocked_site);
        return setBlacklist(blockedSiteList);
    });
}

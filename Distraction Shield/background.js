/**
 * The functions that form the functionality of the extension that takes place in the background.
 * @mixin background
 */

import BlockedSiteList from './classes/BlockedSiteList';
import * as interception from './modules/statistics/interception';
import * as storage from './modules/storage/storage';
import UserSettings from  './classes/UserSettings'
import * as constants from'./constants';
import {isInRegexList} from './modules/stringutil';
import {scrubFromHistory} from './modules/browserutil'
import StorageListener from './modules/storage/StorageListener'

/**
 * Unfortunately webrequestlisteners are not able to process asynchronous functions.
 * Therefore we need a global variable to keep track of the state of the extension.
 * @type {boolean}
 * @memberOf background
 */

let isInterceptionOn = true;

/**
 * inits the background by setting the listener to the {@link BlockedSiteList}
 * @memberOf background
 */
export function initBackground(){
    storage.getBlacklist(function (blockedSiteList) {
        replaceListener(blockedSiteList);
    });
}

/* ---------- ---------- Webrequest functions ----------  ---------- */

/**
 * This function updates the webrequestlistener by passing a {@link BlockedSiteList} to it. From this list, the active urls
 * are taken. If the {@link UserSettings}  is on and there are active urls, a new webrequestlistener is added which intercepts
 * the active urls.
 * @param blockedSiteList {BlockedSiteList} the new list of BlockedSites
 * @memberOf background
 */
function replaceListener(blockedSiteList) {
    removeWebRequestListener();
    storage.getSettings(settings_object => {
        let urlList = blockedSiteList.activeUrls;
        if (settings_object.isInterceptionOn() && urlList.length > 0)
            addWebRequestListener(urlList);
    })
}

/**
 * Adds a listener to the onBeforeRequest which blocks all requests to the urls in the urlList
 * @param urlList {Array} the active urls to be intercepted
 * @memberOf background
 */
function addWebRequestListener(urlList) {
    chrome.webRequest.onBeforeRequest.addListener(
        handleInterception
        , {
            urls: urlList
            , types: ["main_frame"]
        }
        , ["blocking"]
    );
}

/**
 * Clears the onBeforeRequest listener. Used to turn the extension off & to update the listener with a new listener.
 * @memberOf background
 */
function removeWebRequestListener() {
    chrome.webRequest.onBeforeRequest.removeListener(handleInterception);
}


/* ---------- ---------- Interception functions ----------  ---------- */

/**
 * function that does everything that should happen when we decide to intercept the current request.
 * Incrementing counters and modifying url's
 * @param details details about the current webrequest
 * @memberOf background
 */
function intercept(details) {
    interception.incrementInterceptionCounter(details.url);
    interception.addToInterceptDateList();
    let redirectLink = constants.zeeguuExLink;
    let params = constants.tdsRedirectParam + details.url;
    return {redirectUrl: redirectLink + params};
}

/**
 * Function which fires when we enter a website on the blockedsite list.
 * If we come from zeeguu and have completed an exercise than we may continue, else we redirect.
 * @param details the details found by the onWebRequestListener about the current webRequest
 * @memberOf background
 */
function handleInterception(details) {
    if (isInterceptionOn && !isInRegexList(constants.whitelist, details.url)) {
        if (constants.exerciseCompleteRegex.test(details.url)) {
            scrubFromHistory(constants.exerciseCompleteParam);
            let url = details.url.replace(constants.exerciseCompleteRegex, "");
            turnOffInterception();
            return {redirectUrl: url};
        } else {
            return intercept(details);
        }
    }
}

/**
 * turns off interception from the background by setting {@link isInterceptionOn} to false and by retrieving
 * the {@link UserSettings}  from {@link storage} and triggering the turnOffFor function
 * @memberOf background
 */
function turnOffInterception() {
    isInterceptionOn = false;
    storage.getSettings(settings_object => {
        settings_object.turnOffFor(settings_object.interceptionInterval, true);
        storage.setSettings(settings_object);
    })
}

/* ---------- ---------- Storage Listener ----------  ---------- */

/**
 * Actual function that is fired upon the change in storage. If the blockedSiteList changes,
 * we update our listener. If the settings change we encorperate this in the background's behaviour.
 * @param changes data passed by the storage.onChanged event
 * @method handleStorageChange
 * @memberOf background
 */
new StorageListener((changes) => {
    if (constants.tds_blacklist in changes) {
        let newBlockedSiteList = BlockedSiteList.deserializeBlockedSiteList(changes[constants.tds_blacklist].newValue);
        replaceListener(newBlockedSiteList);
    }
    if (constants.tds_settings in changes) {
        let newSettings = UserSettings.deserializeSettings(changes[constants.tds_settings].newValue);
        let oldSettings = UserSettings.deserializeSettings(changes[constants.tds_settings].oldValue);
        isInterceptionOn = newSettings.isInterceptionOn();
        if (!newSettings.isInterceptionOn())
            newSettings.reInitTimer();
        else if (!oldSettings || !oldSettings.isInterceptionOn())
            storage.getBlacklist(blockedSiteList => replaceListener(blockedSiteList));
    }
});


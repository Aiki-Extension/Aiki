import * as blockedSiteBuilder from "../modules/blockedSiteBuilder.js"
import BlockedSiteList from "../classes/BlockedSiteList"
import * as stringutil from "../modules/stringutil.js"
import {openTabSingleton} from "../modules/browserutil"
import * as storage from "../modules/storage/storage"
import * as storageModifier from "../modules/storage/storageModifier"
import StorageListener from "../modules/storage/StorageListener"
import {tds_blacklist} from '../constants'
import {logToFile} from '../modules/logger'
import * as constants from '../constants'

/**
 * Scripts for the tooltip, assigning functions to buttons
 * @mixin tooltipPage
 */

/** @var {JQuery|jQuery|HTMLElement} saveButton Block/Unblock button
 * @memberOf tooltipPage*/
let saveButton = $('#saveBtn');
/** @var {JQuery|jQuery|HTMLElement} optionsButton Options button
 * @memberOf tooltipPage*/
let optionsButton = $('#optionsBtn');
/** @var {JQuery|jQuery|HTMLElement} statisticsButton Statistics button
 * @memberOf tooltipPage*/
let statisticsButton = $('#statisticsBtn');

/** Connects html buttons to their corresponding functions
 * @memberOf tooltipPage*/
function connectButtons() {
    optionsButton.on('click', openOptionsPage);
    statisticsButton.on('click', openStatisticsPage);
    setSaveButtonFunctionality();
}

/** Opens statistics page and closes tooltip
 * @memberOf tooltipPage*/
function openStatisticsPage() {
    openTabSingleton(chrome.runtime.getURL('statisticsPage/statistics.html'), () => {
        window.close();
    });
}

/** Opens options page and closes tooltip
 * @memberOf tooltipPage*/
function openOptionsPage() {
    openTabSingleton(chrome.runtime.getURL('optionsPage/options.html'), () => {
        window.close();
    });
}

/* ----------- ----------- Save button functionality ----------- ----------- */

/**
 * match the current url to the current list of blockedSiteItems
 * @param {string} url to be compared
 * @param {function} callback function that takes the blockedSite to which the url was found to be equal to
 * @memberOf tooltipPage
 */
function patternMatchUrl(url, callback) {
    storage.getBlacklistPromise().then(blockedSiteList => {
        let item = null;
        blockedSiteList.some(function (bl) {
            if (stringutil.wildcardStrComp(url, bl.url)) {
                item = bl;
                return true;
            }
            return false;
        });
        callback(item);
    });

}

/**
 * returns a function that gets the corresponding BlockedSite from the background and updates its checkboxVal to the new value.
 * @param url of the current page
 * @memberOf tooltipPage
 */
function toggleBlockedSite(url) {
    return function () {
        storage.getBlacklistPromise().then(blockedSiteList => {
            let list = blockedSiteList;
            let newItem = null;
            for (let i = 0; i < list.length; i++) {
                if (stringutil.wildcardStrComp(url, list[i].url)) {
                    newItem = list[i];
                    newItem.checkboxVal = !newItem.checkboxVal;
                    storageModifier.updateBlockedSiteInStorage(newItem);
                    logToFile(constants.logEventType.changed, newItem.name, (newItem.checkboxVal ? 'enabled' : 'disabled'), constants.logType.settings);
                    break;
                }
            }
        });
    }
}
/**
 * Changes the text of {@link saveButton} to Block/Unblock
 * @param blocked {boolean} true = 'Block', false = 'Unblock'
 * @memberOf tooltipPage
 */
function setSaveButton(blocked){
    if (blocked)
        saveButton.text("Block");
    else
        saveButton.text("Unblock");
}

/**
 * Change colour and update functionality of {@link saveButton} when we add a new website to the blockedSiteList
 * @memberOf tooltipPage
 */
function setSaveButtonToSuccess() {
    saveButton.attr('class', 'btn btn-success');
    saveButton.text("Success!");
    saveButton.unbind();
    setTimeout(function () {
        saveButton.attr('class', 'btn btn-info');
        setSaveButton(true);
        setSaveButtonFunctionality();
    }, 3000);
}

function saveCurrentPageToBlacklist() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        let activeTab = arrayOfTabs[0];
        blockedSiteBuilder.createBlockedSiteAndAddToStorage(activeTab.url)
            .catch((error) => {
                chrome.extension.getBackgroundPage().alert(error);
            });
    });
}

/**
 * Update the functionality of {@see saveButton} to one of 3 states:
 * <ul style="list-style: none;">
 * <li>1. Add a non-blacklisted website to the blacklist/blockedSiteList
 * <li>2. Disable the blocking of this blacklisted website
 * <li>3. Enable the blocking of this blacklisted website
 * </ul>
 * @memberOf tooltipPage
 */
function setSaveButtonFunctionality() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        let activeTab = arrayOfTabs[0];
        let url = activeTab.url;
        patternMatchUrl(url, function (matchedBlockedSite) {
            saveButton.unbind();
            if (matchedBlockedSite != null) {
                saveButton.on('click', toggleBlockedSite(url));
                if (matchedBlockedSite.checkboxVal) {
                    setSaveButton(false);
                } else {
                    setSaveButton(true);
                }
            } else {
                saveButton.on('click', saveCurrentPageToBlacklist);
                setSaveButton(true);
            }
        });
    });
}

/**
 * Storage Listener
 * @type {StorageListener}
 * @method onStorageChange
 * @memberOf tooltipPage
 */

new StorageListener((changes) => {
    if (tds_blacklist in changes) {
        let oldBlockedSiteList = BlockedSiteList.deserializeBlockedSiteList(changes[tds_blacklist].oldValue);
        let newBlockedSiteList = BlockedSiteList.deserializeBlockedSiteList(changes[tds_blacklist].newValue);
        if (oldBlockedSiteList.length < newBlockedSiteList.length) {
            setSaveButtonToSuccess();
        } else {
            setSaveButtonFunctionality();
        }
    }
});

/**
 * function that initiates the functionality of the tooltip
 * @memberOf tooltipPage
 */
document.addEventListener("DOMContentLoaded", function () {
    connectButtons();
});
import {initBackground} from './background';
import * as storage from './modules/storage/storage';
import BlockedSiteList from './classes/BlockedSiteList';
import UserSettings from './classes/UserSettings';
import * as uuid from './modules/UUIDGenerator'
import Tracker from './modules/statistics/Tracker';
import * as logger from './modules/logger'


/**
 * This is ran when the extension is loaded.
 * @mixin init
 */

/**
 * This function to be fired only when the extension is installed or updated. It initializes all the data and the storage.
 * Furthermore it starts the intro tour and initializes the extension upon completion.
 * @memberOf init
 */
chrome.runtime.onInstalled.addListener(details => {
    storage.getAllUnParsed((output) => {
        initBlacklist(output.tds_blacklist);
        initInterceptCounter(output.tds_interceptCounter);
        initInterceptDateList(output.tds_interceptDateList);
        initExerciseTime(output.tds_exerciseTime);
        initSettings(output.tds_settings);
        initAlarm();
        if (details.reason === 'install') {
            runIntroTour();
        }
    });
});

/**
 * Initializes the storage with a BlockedSiteList object.
 * @param list {?BlockedSiteList} BlockedSiteList received from storage
 * @memberOf init
 */
function initBlacklist(list) {
    if (list == null) {
        let blockedSiteListToStore = new BlockedSiteList();
        storage.setBlacklist(blockedSiteListToStore);
    }
}

/**
 * Initializes the storage with a BlockedSiteList object.
 * @param settings {?UserSettings} BlockedSiteList received from storage
 * @memberOf init
 */
function initSettings(settings) {
    if (settings == null) {
        let id = uuid.generateUUID();
        let settingsToStore = new UserSettings(id);
        storage.setSettingsWithCallback(settingsToStore, initSession);
    }
}

/**
 * Initializes the storage with a BlockedSiteList object.
 * @param counter {?number} BlockedSiteList received from storage
 * @memberOf init
 */
function initInterceptCounter(counter) {
    if (counter == null)
        storage.setInterceptCounter(0);
}

/**
 * Initializes the storage with a date list.
 * @param dateList {?Array} Date list received from storage
 * @memberOf init
 */
function initInterceptDateList(dateList) {
    if (dateList == null)
        storage.setInterceptDateList([]);
}

/**
 * Initializes the storage with an exercise time list.
 * @param exerciseTime {?Array} exercise time list received from storage
 * @memberOf init
 */
function initExerciseTime(exerciseTime) {
    if (exerciseTime == null)
        storage.setExerciseTimeList([]);
}

/**
 * Runs the intro tour in a new tab.
 * @memberOf init
 */
function runIntroTour() {
    chrome.tabs.create({'url': chrome.runtime.getURL('introTour/introTour.html')});
}

/**
 * Starts the logger alarm. {@link logger}
 * @memberOf init
 */
function initAlarm(){
    logger.setAlarm();
}

/** --------------- ---- Run upon Start of session ---- ---------------*/

/**
 * function which checks whether we run a normal session or the special case where the onInstalled function is called.
 * @memberOf init
 */
storage.getSettingsUnParsed(settings => {
    if (settings != null)
        initSession();
});

/**
 * function which fires upon starting the browser. Initiates the session.
 * @memberOf init
 */
function initSession() {
    storage.getSettings(settings => {
        settings.reInitTimer();
    });
    let tracker = new Tracker();
    tracker.init();
    initBackground();
}
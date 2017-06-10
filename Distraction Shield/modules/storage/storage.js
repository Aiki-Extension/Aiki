import BlockedSiteList from '../../classes/BlockedSiteList'
import UserSettings    from '../../classes/UserSettings'
import * as constants  from '../../constants'

/**
 * The general API between the chrome.storage and the extension. This is the
 * part throughout which we get and set, store and retrieve, data that is concerned with the application.
 * This module has one purpose only: getting and setting
 * Due to asynchronousness this is all done through promises
 * @module storage
 */

/* ---------------- General methods --------------- */

/**
 * used to set items stored in the storage of the chrome api. Returns a promise
 * @param {string} dataKey key of the data to store
 * @param {string} dataValue value of data to store
 * @param {boolean} isLocal used to distinguish between using local or sync storage (default sync)
 * @method setStorage
 * @private
 */
function setStorage(dataKey, dataValue, isLocal = false) {
    return new Promise(function (resolve, reject) {
        let storage = (isLocal ? chrome.storage.local : chrome.storage.sync);
        let newObject = {};
        newObject[dataKey] = dataValue;
        storage.set(newObject, function () {
            if (handleRuntimeError()) {
                resolve();
            } else {
                reject(Error("Data cannot be set."));
            }
        })
    });
}

/**
 * used to retrieve items stored from the storage of the chrome api. Returns a promise due to asynchronousness
 * @param {string} dataKey key of the data to store
 * @param {boolean} isLocal used to distinguish between using local or sync storage (default sync)
 * @method getStorage
 * @private
 */
function getStorage(dataKey, isLocal = false) {
    return new Promise(function (resolve, reject) {
        let storage = (isLocal ? chrome.storage.local : chrome.storage.sync);
        storage.get(dataKey, function (output) {
            if (handleRuntimeError()) {
                if (dataKey === null || dataKey.length > 1) {
                    resolve(output);
                } else {
                    resolve(output[dataKey]);
                }
            } else {
                reject(Error("Data cannot be found."));
            }
        })
    });
}

/* ---------------- TDS_Storage --------------- */

/**
 * Gets everything TDS stores from the storage. Also parses all data that needs to be deserialized.
 * @param {function} callback function that takes the result of this get as parameter
 * @method getAll
 */
export function getAll(callback) {
    getStorage(constants.tds_all).then(function (output) {
        output.tds_settings = UserSettings.deserializeSettings(output.tds_settings);
        output.tds_blacklist = BlockedSiteList.deserializeBlockedSiteList(output.tds_blacklist);
        return callback(output);
    });
}

/**
 * Gets everything TDS stores from the storage. This does not parse any data that needs to be deserialized.
 * @param {function} callback function that takes the result of this get as parameter
 * @method getAllUnParsed
 */
export function getAllUnParsed(callback) {
    getStorage(constants.tds_all).then(function (output) {
        return callback(output);
    });
}

/* ---------------- BlockedSiteList / Blacklist --------------- */

/**
 * Gets the {@link BlockedSiteList} from the storage and parses it, before passing it on to the callback
 * @param {function} callback function that takes the result of this get as parameter
 * @method getBlacklist
 */
export function getBlacklist(callback) {
    getStorage(constants.tds_blacklist).then(function (output) {
        output.tds_blacklist = BlockedSiteList.deserializeBlockedSiteList(output.tds_blacklist);
        return callback(output.tds_blacklist);
    });
}

/**
 * Gets a promise to the @link BlockedSiteList in the storage
 * @returns {Promise}
 * @method getBlacklistPromise
 */
export function getBlacklistPromise() {
    return getStorage(constants.tds_blacklist).then((output) =>
        BlockedSiteList.deserializeBlockedSiteList(output.tds_blacklist)
    );
}

/**
 * Serializes and then sets the {@link BlockedSiteList} in the storage.
 * @param {BlockedSiteList} blockedSiteList function that takes the result of this get as parameter
 * @method setBlacklist
 */
export function setBlacklist(blockedSiteList) {
    let serializedList = BlockedSiteList.serializeBlockedSiteList(blockedSiteList);
    setStorage(constants.tds_blacklist, serializedList);
}

/* ---------------- Settings Object --------------- */

/**
 * Gets the {@link UserSettings} from the storage and parses it, before passing it on to the callback
 * @param {function} callback function that takes the result of this get as parameter
 * @method getSettings
 */
export function getSettings(callback) {
    getStorage(constants.tds_settings).then(function (output) {
        let deserializedSettings = UserSettings.deserializeSettings(output.tds_settings);
        return callback(deserializedSettings);
    });
}

/**
 * Gets an unparsed version of the {@link UserSettings} from the storage
 * @param callback function that takes this unparsed output
 * @method getSettingsUnParsed
 */
export function getSettingsUnParsed(callback) {
    getStorage(constants.tds_settings).then(function (output) {
        return callback(output.tds_settings);
    });
}

/**
 * Serializes and then sets the {@link UserSettings} in the storage.
 * @param {UserSettings} settingsObject The object we want to set in the storage
 * @method setSettings
 */
export function setSettings(settingsObject) {
    return setStorage(constants.tds_settings, UserSettings.serializeSettings(settingsObject));
}

/**
 * Serializes and then sets the {@link UserSettings} in the storage, after this it calls the callback function.
 * @param {UserSettings} settingsObject The object we want to set in the storage
 * @param {function} callback the function to be called once we return
 * @method setSettingsWithCallback
 */
export function setSettingsWithCallback(settingsObject, callback) {
    let serializedSettings = UserSettings.serializeSettings(settingsObject);
    setStorage(constants.tds_settings, serializedSettings).then(function () {
        return callback()
    });
}

/**
 * Gets the current mode in the settings from the storage.
 * @param {function} callback function to be called that takes the mode as parameter
 * @method getMode
 */
export function getMode(callback) {
    getSettings(function (settings) {
        callback(settings.mode);
    });
}

/* ---------------- Statistics --------------- */

/**
 * Gets the current interceptCount from the storage.
 * @method getInterceptCounter
 */
export function getInterceptCounter() {
    return getStorage(constants.tds_interceptCounter);
}

/**
 * Sets the interceptCounter to a new value
 * @param {int} number the new value of the counter
 * @method setInterceptCounter
 */
export function setInterceptCounter(number) {
    return setStorage(constants.tds_interceptCounter, number);
}

/**
 * Gets the current InterceptDatelist.
 * @method getInterceptDateList
 */
export function getInterceptDateList() {
    return getStorage(constants.tds_interceptDateList);
}

/**
 * Sets the current dateList in the storage
 * @param {array} dateList the new value of the dateList to be set
 * @method setInterceptDateList
 */
export function setInterceptDateList(dateList) {
    return setStorage(constants.tds_interceptDateList, dateList);
}

/**
 * Gets the ExerciseTime array from the storage
 * @method getExerciseTimeList
 */
export function getExerciseTimeList() {
    return getStorage([constants.tds_exerciseTime]);
}

/**
 * Sets the exerciseTime array into the storage
 * @param {array} statList the new value of the exerciseTime array
 * @method setExerciseTimeList
 */
export function setExerciseTimeList(statList) {
    return setStorage(constants.tds_exerciseTime, statList);
}

/* ---------------- Logger --------------- */

/**
 * Gets the logs from the storage and passes it on to the callback
 * @param {function} callback takes the logs once we get them from the storage
 * @method getLogs
 */
export function getLogs(callback) {
    getStorage([constants.tds_logs], true).then(output => {
        callback(output);
    });
}

/**
 * Sets the logs in the storage
 * @param {string} logs the logs to be stored in local.storage
 * @method setLogs
 */
export function setLogs(logs) {
    return setStorage(constants.tds_logs, logs, true);
}

/**
 * Removes all the logs from the storage. This is run after we update the logfile in chrome.local.storage
 * @method clearLogs
 */
export function clearLogs(){
    chrome.storage.local.remove(constants.tds_logs);
}

/**
 * Sets the logfile into the storage
 * @param {string} data the logfile to be stored in loca.storage
 * @method setLogFile
 */
export function setLogFile(data){
    return setStorage(constants.tds_logfile, data, true);
}

/**
 * Checks for a runtime error.
 * @method handleRuntimeError
 * @private
 */
function handleRuntimeError() {
    if (chrome.runtime.error) {
        console.log("Runtime error.\n" + chrome.runtime.error);
        return false;
    }
    return true;
}

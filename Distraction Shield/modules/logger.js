import * as storage from '../modules/storage/storage'
import * as constants from '../constants'

/**
 * This module is meant to be used for logging actions of the user and for statistics.
 * This module retrieves the UUID, generated on install, from the storage and uses this to link data to the user anonymously.
 * The module also dumps the logs every specified time interval.
 * This is simply done by clearing the separate log lines and combining them into one file which is stored in the storage.
 * This can be retrieved using the “tds_logfile” key.
 * Also when given permission by the user (default yes), the data is sent to a specified API.
 * @module logger
 */

/**
 * creates a log format "ID + args + on time"
 * @param event {logEventType} describes the action performed
 * @param trigger {string}  what triggered the event
 * @param value value of event, default = null
 * @param type {logType} type of the event (options, statistics ..)
 */
export function logToFile(event, trigger = '', value = null, type = 'undefined') {
    let time = new Date().toJSON();
    getUUID(id => {
        let data = {id:id, event:event, trigger:trigger, value:value, time:time, type:type};
        storeLog(data);
    });
}

export function setAlarm() {
    chrome.alarms.create('logdump', {delayInMinutes: constants.LOGGING_ALARM_DELAY, periodInMinutes: constants.LOGGING_INTERVAL });
    chrome.alarms.onAlarm.addListener(alarm => {
        if (alarm.name === 'logdump') {
            scheduledLogDump();
        }
    });
}

/**
 * This dumps the log from the storage to the server (if user gave permission?)
 * After that, it clears the logs.
 */
function scheduledLogDump() {
    storage.getSettings(settings_object => {
        storage.getLogs(data => {
            if (settings_object.collectData)
                sendLogsTo(data);
            dumpToFile(data);
            clearLogs();
        });
    });

}

function clearLogs(){
    storage.clearLogs();
}

/**
 * This function dumps the array of logs in a logfile containing the date & logs.
 * @param data
 */
function dumpToFile(data){
    let time = new Date().toJSON();
    let string = `'{"date":${time},"data":${data}}'`;
    storage.setLogFile(string);
}

/**
 * retrieves UUID from userSettings
 * @callback callback for UUID
 */
function getUUID(callback){
    storage.getSettings(data => {
        callback(data.UUID);
    });
}

/**
 * Append new log to existing log.
 */
function storeLog(data){
    storage.getLogs(logs => {
        if (logs != undefined)
            logs.push(data);
        else
            logs = [data];
        storage.setLogs(logs);
    });
}

/**
 * Sends current log file to dst
 * @param data formatted data to be sent
 */
function sendLogsTo(data){
    $.ajax({
        headers: {
            'content-type': 'application/json'
        },
        url: 'http://127.0.0.1:5000/submit', //TODO get API url to send data to
        data: JSON.stringify(data),
        type: "POST"
    });
}
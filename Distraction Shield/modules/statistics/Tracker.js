import * as constants from '../../constants';
import * as exerciseTime from './exerciseTime';
import * as storage from '../storage/storage'
import BlockedSiteList from '../../classes/BlockedSiteList'
import StorageListener from "../storage/StorageListener"
import * as logger from '../../modules/logger'

export default class Tracker {

    /**
     * The tracker tracks whether you are currently working on exercises.
     * Every second, the "alarm" is fired, and the url of the current tab is examined.
     * If this url corresponds with the zeeguu url, the time spent on exercises counter is incremented.
     * @constructs Tracker
     * @class
     */
    constructor() {
        /** @member {boolean} Tracker#wasIdle */
        this.wasIdle = false;
        /** @member {BlockedSiteList} Tracker#blockedsites */
        this.blockedsites = new BlockedSiteList();
        /** @member {Date} Tracker#previousTime */
        this.previousTime = new Date();
        /** @member {Tab} Tracker#currentTab */
        this.currentTab = null;
        this.getCurrentTab().then((tab) => this.currentTab = tab).catch(() => this.currentTab = null);
    }

    /**
     * gets the current tab
     * @returns {Promise}
     * @function Tracker#getCurrentTab
     */
    getCurrentTab() {
        return new Promise(function (resolve, reject) {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                if (tabs.length == 1) {
                    resolve(tabs[0]);
                } else {
                    reject("There is no current tab.");
                }
            });
        });
    }

    /**
     * Initialize the alarm, and initialize the idle-checker.
     * @function Tracker#init
     */
    init() {
        this.getBlockedSites();
        new StorageListener(this.handleStorageChange.bind(this));

        this.addIdleListener();
        this.addAlarmListener();
        this.addOnActiveTabChangeListener();
        this.addOnTabUpdateListener();

        this.createTrackerAlarm();
    }

    /**
     * This function is called everytime the time spent on exercises or
     * on a blocked site needs to be updated.
     * This occurs when the trackerAlarm fires, the idleState is updated,
     * the active tab is changed, or the tab is updated.
     * @function Tracker#triggerUpdateTime
     */
    triggerUpdateTime() {
        let tab = this.currentTab;
        let timeSpent = new Date() - this.previousTime;
        this.previousTime = new Date();
        if(!this.wasIdle) {
            if(tab) {
                if (this.compareDomain(tab.url, constants.zeeguuExTracker)) {
                    this.incTimeExercises(timeSpent);
                    logger.logToFile(constants.logEventType.spent, `exercises`, `${timeSpent/1000}`, constants.logType.statistics);
                } else {
                    this.matchToBlockedSites(tab.url).then((site) => {
                        this.incTimeBlockedSite(site, timeSpent);
                        logger.logToFile(constants.logEventType.spent, `${tab.url}`, `${timeSpent/1000}`, constants.logType.statistics);
                    });
                }
            }
        } else {
            this.wasIdle = false;
        }
    }

    /**
     * Creates the tracker alarm which fires every x minutes. x defined by constants.trackerAlarmFrequency
     * @function Tracker#createTrackerAlarm
     */
    createTrackerAlarm(){
        chrome.alarms.create('trackerAlarm', {periodInMinutes: constants.trackerAlarmFrequency});
    }

    /**
     * Function which updates the idle state. If the user goes idle, triggerUpdateTime is fired, and the
     * trackerAlarm is removed.
     * If the user becomes active again, the triggerUpdateTime is fired,
     * and the trackerAlarm is created again.
     * @param idleState state received from the idleListener
     * @function Tracker#updateIdleState
     */
    updateIdleState(idleState) {
        if(idleState == "idle") {
            chrome.alarms.clear("trackerAlarm");
        } else if (idleState == "active") {
            this.wasIdle = true;
            this.createTrackerAlarm();
        }
        this.triggerUpdateTime();
    }

    /**
     * Adds a idleListener to the background to detect whether a user is idle or not.
     * @function Tracker#addIdleListener
     */
    addIdleListener() {
        // When the user does not input anything for 15 seconds, set the state to idle.
        chrome.idle.setDetectionInterval(constants.idleTime);
        chrome.idle.onStateChanged.addListener(this.updateIdleState.bind(this));
    }

    /**
     * Adds an alarmListener to listen for the trackerAlarm. Every time the alarm ticks, the triggerUpdateTime
     * method is fired.
     * @function Tracker#addAlarmListener
     */
    addAlarmListener() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            if(alarm && alarm.name == 'trackerAlarm') {
                this.getCurrentTab().then((tab) => {
                   if(tab.url === this.currentTab.url) {
                       this.triggerUpdateTime();
                   } else {
                       this.currentTab = tab;
                   }
                }).catch(() => {
                    this.currentTab = null;
                })
            }
        });
    }

    /**
     * Adds an onActiveTabChangeListener. When a tab becomes active, the triggerUpdateTime method is called.
     * @function Tracker#addOnActiveTabChangeListener
     */
    addOnActiveTabChangeListener() {
        chrome.tabs.onActivated.addListener((activeInfo) => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                if(typeof tab !== 'undefined') {
                    this.triggerUpdateTime();
                    this.currentTab = tab;
                } else {
                    this.currentTab = null;
                }
                if(chrome.runtime.lastError) return;
            })
        });
    }
    /**
     * Adds an onTabUpdateListener. When a tab updates(e.g. a new address is filled in), the triggerUpdateTime method is called.
     * @function Tracker#addOnTabUpdateListener
     */
    addOnTabUpdateListener() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if(changeInfo.status === 'loading') {
                chrome.tabs.query({active: true}, (tabs) => {
                    if(tabId == tabs[0].id) {
                        this.triggerUpdateTime();
                        this.currentTab = tab;
                    }
                });
            }
        });
    }

    /**
     * Handles the changes received from the storageOnChangedListener.
     * @param changes received from the storageOnChangedListener.
     * @function Tracker#handleStorageChange
     */
    handleStorageChange(changes) {
        if (constants.tds_blacklist in changes) {
            let newBlockedSiteList = BlockedSiteList.deserializeBlockedSiteList(changes[constants.tds_blacklist].newValue);
            // Extract the time-spent values from the this.blockedsites.
            let timeValues = this.retrieveTimeSpent(this.blockedsites);
            // Replace this.blockedsites with the data from the storage
            this.blockedsites = newBlockedSiteList;
            // Put the extracted time-spent values back into this.blockedsites
            this.putBackTimeSpent(timeValues);
        }
    }

    /**
     * Get a list of the time wasted on all BlockedSites from the BlockedSiteList
     * @param {BlockedSiteList} blockedsites
     * @returns {Array}
     * @function Tracker#retrieveTimeSpent
     */
    retrieveTimeSpent(blockedsites) {
        let list = [];
        blockedsites.map((item) => list.push({'domain': item.domain, 'timeSpent': item.timeSpent}));
        return list;
    }

    /**
     * Puts the timeValues previously extracted using the retrieveTimeSpent method back in to the
     * {@link Tracker#blockedsites} field.
     * @param timeValues
     * @function Tracker#putBackTimeSpent
     */
    putBackTimeSpent(timeValues) {
        this.blockedsites.map((blockedSite) => {
            let bSite = timeValues.find((timeValue) => timeValue.domain == blockedSite.domain);
            if (typeof bSite !== 'undefined') blockedSite.timeSpent = bSite.timeSpent;
        });
    }

    /**
     * adds the BlockedSiteList from the storage to {@link Tracker#blockedsites}.
     * @function Tracker#getBlockedSites
     */
    getBlockedSites() {
        storage.getBlacklistPromise().then((result) => {
            this.blockedsites.addAllToList(result);
        });
    }

    /**
     * Increments the time spent on exercises using the exerciseTime module.
     * @param timeSpent the amount by which the time spent should be incremented.
     * @function Tracker#incTimeExercises
     */
    incTimeExercises(timeSpent) {
        exerciseTime.incrementTodayExerciseTime(timeSpent);
    }

    /**
     * Increments the timeSpent for the blockedSite inputted.
     * @param site the blockedSite of which the timeSpent should be incremented.
     * @param timeSpent the amount by which the time spent should be incremented.
     * @function Tracker#incTimeBlockedSite
     */
    incTimeBlockedSite(site, timeSpent) {
        site.timeSpent += timeSpent;
        storage.setBlacklist(this.blockedsites);
    }

    /**
     * Matches the inputted tab to the blocked sites.
     * @param tabActive
     * @returns {Promise} resolves to the matched blockedSite. Rejects if there is no match.
     * @function Tracker#matchToBlockedSites
     */
    matchToBlockedSites(tabActive) {
        return new Promise((resolve, reject) => {
            let match = this.blockedsites.find((site) => this.compareDomain(tabActive, site.domain));
            if (typeof match !== 'undefined') resolve(match);
        });
    }

    /**
     * Compares the domain of an url to another domain using a regex.
     * @param url Url to be compared.
     * @param domain Domain of which a regex is created.
     * @returns {Boolean} containing whether the domain-regex matches the url.
     * @function Tracker#compareDomain
     */
    compareDomain(url, domain) {
        return Tracker.compareUrlToRegex(this.createRegexFromDomain(domain), url);
    };

    /**
     * Creates a regex string which using the domain of an url.
     * @param domain of which a regex should be created.
     * @returns {string} regex string
     * @function Tracker#createRegexFromDomain
     */
    createRegexFromDomain(domain) {
        return "^(http[s]?:\\/\\/)?(.*)" + domain + ".*$";
    };

    /**
     * Compare regex to url.
     * @param regex
     * @param url
     * @returns {Boolean} Returns true if the url matches the regex. False if they do not match.
     * @function Tracker#compareUrlToRegex
     */
    static compareUrlToRegex(regex, url) {
        return RegExp(regex).test(url);
    }

}

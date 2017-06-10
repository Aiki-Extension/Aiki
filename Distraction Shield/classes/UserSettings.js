import * as constants from '../constants'
import * as storage from '../modules/storage/storage'

export default class UserSettings {

    /**
     * This object holds all the data that is connected to the user's preferences.
     * Furthermore has the functionality to turn the interception part of the of extension on or off.
     * Since the current state is saved here too.
     * @param {string} id parameter for user's uuid (default = undefined)
     * @constructs UserSettings
     * @class
     */
    constructor(id = undefined) {

        /**
         * @typedef {Object} settingsStatus
         * @property {boolean} state Is interception on?
         * @property {Date} setAt Time at which we changed this status object
         * @property {Date} offTill Time until when the interception turned off,
         * less or equal to current time if interception is on
         * @member {settingsStatus} UserSettings#status The current interception status, it has three fields of its own
         */
        this._status = {
            state: true,
            setAt: new Date(),
            offTill: new Date()
        };
        /** @member {object} UserSettings#mode The current mode of the Distraction Shield's interception */
        this._mode = constants.modes.lazy;
        /** @member {int} UserSettings#interceptionInterval Amount of minutes user is allowed to browse after completing an exercise */
        this._interceptionInterval = 1;
        /** @member {string} UserSettings#UUID The user's current UUID, used for statistics and logging */
        this._UUID = id;
        /** @member {boolean} UserSettings#collectData the value of the data collection checkbox on the optionsPage */
        this._collectData = true;
    }

    set interceptionInterval(val) { this._interceptionInterval = val; }
    get interceptionInterval() { return this._interceptionInterval; }

    set mode(newMode) { this._mode = newMode; }
    get mode() { return this._mode; }

    set collectData (collectData) { this._collectData = collectData; }
    get collectData () { return this._collectData; }

    set status(newStatus) { this._status = newStatus; }
    get status() { return this._status; }

    set offTill(time) { this._status.offTill = time; }
    get offTill() { return this._status.offTill; }

    set UUID(uuid) {this._UUID = uuid;}
    get UUID() { return this._UUID;}

    isInterceptionOn() { return this.status.state; }

    /**
     * Turn the interception back on
     * @function UserSettings#turnOn
     */
    turnOn() {
        if (!this.isInterceptionOn()) {
            this.status = {state: true, setAt: new Date(), offTill: new Date()};
        } else {
            console.log("Already turned on, should not happen!");
        }
    }

    /**
     * Turn interception off. The timer variable is for deciding whether we want to initiate a javascript timeout.
     * Which will automatically turn the interception back on after it stops. This nonly happens in the background, because
     * third party pages might close while the timer runs. Which makes the turning off and on of the interception go wrong.
     * @param {boolean} timer should we set a timer, for when to turn on? (true for background, false for other (third party) page)
     * @function UserSettings#turnOff
     */
    turnOff(timer) {
        if (this.isInterceptionOn()) {
            this.status = {state: false, setAt: new Date(), offTill: this.status.offTill};
            if (timer) {
                this.setTimer();
            }
        } else {
            console.log("Already turned off, should not happen!");
        }
    }

    /**
     * Turns extension off for the specified amount of minutes
     * @param {int} minutes amount of minutes that interception needs to be off
     * @param {boolean} timer should we set a timer, for when to turn on? (true for background, false for other (third party) page)
     * @function UserSettings#turnOffFor
     */
    turnOffFor(minutes, timer) {
        let curDate = new Date();
        this.offTill = new Date(curDate.setMinutes(minutes + curDate.getMinutes()));
        this.turnOff(timer);
    }

    /**
     * Turns interception off until 00:00:00 the next day.
     * @param {boolean} timer should we set a timer, for when to turn on? (true for background, false for other (third party) page)
     * @function UserSettings#turnOffForDay
     */
    turnOffForDay(timer) {
        this.offTill = new Date(new Date().setHours(24, 0, 0, 0));
        this.turnOff(timer);
    }

    /**
     * Turn the interception of the extension back on and update the storage to the new settingObject
     * @function UserSettings#turnExtensionBackOn
     */
    turnExtensionBackOn() {
        return () => {
            if (!this.isInterceptionOn()) {
                this.turnOn();
                storage.setSettings(this);
            }
        };
    }

    /**
     * Run a timer until we need to turn interception back on
     * @function UserSettings#setTimer
     * @private
     */
    setTimer() {
        let timerInMS = this.status.offTill - new Date();
        setTimeout(this.turnExtensionBackOn(), timerInMS);
    }

    /**
     * reInitialize the timer that turns interception back on, if there is need for this. Used for example when browser
     * is closed and re-opened.
     * @function UserSettings#reInitTimer
     */
    reInitTimer() {
        if (!this.isInterceptionOn()) {
            if (this.offTill < new Date()) {
                this.turnOn();
                storage.setSettings(this);
            } else {
                this.setTimer();
            }
        }
    }

    /* --------------- --------------- Serialization --------------- --------------- */

    /**
     * @param {UserSettings} settingsObject SettingsObject to serialize
     * @returns {string} stringified UserSettings
     * @function UserSettings#serializeSettings
     */
    static serializeSettings(settingsObject) {
        return JSON.stringify(settingsObject);
    }

    /**
     * @param {object} parsedSettingsObject SettingsObject in object form, needs to be converted to instance of SettingsObject
     * @returns {UserSettings}
     * @function UserSettings#parseSettingsObject
     */
    static parseSettingsObject(parsedSettingsObject) {
        let s = new UserSettings();
        parsedSettingsObject._status.setAt = new Date(parsedSettingsObject._status.setAt);
        parsedSettingsObject._status.offTill = new Date(parsedSettingsObject._status.offTill);
        s.status = parsedSettingsObject._status;
        s.interceptionInterval = parsedSettingsObject._interceptionInterval;
        s.mode = parsedSettingsObject._mode;
        s.collectData = parsedSettingsObject._collectData;
        s.UUID = parsedSettingsObject._UUID;
        return s;
    }

    /**
     * @param {string} serializedSettingsObject Stringified SettingsObject to be deserialized
     * @returns {UserSettings}
     * @function UserSettings#deserializeSettings
     */
    static deserializeSettings(serializedSettingsObject) {
        if (serializedSettingsObject != null) {
            let parsed = JSON.parse(serializedSettingsObject);
            return this.parseSettingsObject(parsed);
        }
        return null;
    }

}

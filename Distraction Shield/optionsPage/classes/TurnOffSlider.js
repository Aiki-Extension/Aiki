import GreenToRedSlider from './GreenToRedSlider'
import UserSettings from '../../classes/UserSettings'
import * as constants from '../../constants'
import * as storage from '../../modules/storage/storage'
import * as logger from '../../modules/logger'
import StorageListener from '../../modules/storage/StorageListener'

/**
 * Subclass of the GreenToRedSlider, this also connects a button to the set of html_elements.
 * Furthermore it connects a userSettings item and fires functions according to the values of the
 * html_elements in order to manipulate the settings and let the user specify what he/she wants from the extension
 * Specifically turning the interception off or back on for a given amount of time
 *
 * @augments GreenToRedSlider
 * @class TurnOffSlider
 * @param sliderID {string} The ID of the sliderDiv
 */
export default class TurnOffSlider extends GreenToRedSlider {

    constructor(sliderID) {
        super(sliderID, (value) => {
            this.selectedTime = parseInt(value);
        });
        this.selectedTime = 10;
        this.offButton = $(this.sliderDiv.find(sliderID + "-offBtn"));
        this.sliderRange[0].max = constants.MAX_TURN_OFF_TIME;
        this.offButton[0].slider = this;
        this.sliderValue.html(this.calculateHours(this.sliderRange.val()));
        this.setValue(this.sliderRange.val());
        this.init();
    }

    /**
     * Initializer function for a TurnOffSlider
     * @function TurnOffSlider#init
     * @inner
     */
    init(){
        storage.getSettings(settings_object => {
            this.updateSettings(settings_object);
        });
        this.addStorageListener();
    }

    /**
     * Create the right type of message or slider to be shown next to the turn off/on button.
     * @param {UserSettings} settings_object the {@link UserSettings} on which we decide what to show
     * @function TurnOffSlider#toggleShowOffMessage
     * @inner
     */
    toggleShowOffMessage(settings_object) {
        if (!settings_object.isInterceptionOn()) {
            this.sliderValue.html(this.createOffMessage(settings_object));
            this.sliderRange.hide();
            this.sliderValue.parent().css('width', '50%');
            this.sliderValue.prop('contenteditable', false);
        } else {
            this.sliderValue.html(this.calculateHours(this.selectedTime));
            this.sliderRange.show();
            this.sliderValue.parent().css('width', '30%');
            this.sliderValue.prop('contenteditable', true);
        }
    }

    /**
     * Format a Date object to the correct displayable version
     * @param {Date} date
     * @function TurnOffSlider#formatDate
     * @inner
     */
    static formatDate(date) {
        let arr = date.toString().split(" ");
        return arr.splice(0, 5).join(" ");
    }

    /**
     * Function that overrides the {@link GreenToRedSlider} function
     * @param {int} hours
     * @param {int} minutes
     * @param {int} val the value of the slider
     * @function TurnOffSlider#createMessage
     * @inner
     */
    createMessage(hours, minutes, val){
        if (val == constants.MAX_TURN_OFF_TIME)
            return "for the rest of the day";
        return "for " + (hours > 0 ? hours + ":" + minutes + " hours." : minutes + " minute(s).");
    }

    /**
     * Create the right type of message or slider to be shown next to the turn off/on button.
     * @param {UserSettings} settings_object the {@link UserSettings} that we use to generate the TurnOffMessage
     * @function TurnOffSlider#createOffMessage
     * @inner
     */
    createOffMessage(settings_object) {
        return "Turned off until: " + TurnOffSlider.formatDate(settings_object.status.offTill);
    }

    /**
     * Updater function that updates the slider with the new {@link UserSettings}
     * @param {UserSettings} userSettings the {@link UserSettings} on which we want the slider to update
     * @function TurnOffSlider#updateSettings
     * @inner
     */
    updateSettings(userSettings) {
        this.toggleShowOffMessage(userSettings);
        this.offButton.text("Turn " + (userSettings.isInterceptionOn() ? "Off" : "On"));
    }

    /**
     * The function to be fired when we hit the TurnOff/On button
     * @function TurnOffSlider#offButtonFunc
     * @inner
     */
    offButtonFunc() {
        storage.getSettings(settings_object => {
            let slider = this.slider;
            if (settings_object.isInterceptionOn()) {
                if (slider.selectedTime === constants.MAX_TURN_OFF_TIME) {
                    settings_object.turnOffForDay();
                } else {
                    settings_object.turnOffFor(slider.selectedTime);
                }
            } else {
                settings_object.turnOn();
            }
            storage.setSettings(settings_object);
            logger.logToFile(constants.logEventType.changed, `extension ${(settings_object.isInterceptionOn() ? 'on' : 'off')}`,
                (!settings_object.isInterceptionOn() ? slider.selectedTime : ``), constants.logType.settings);
        });
    }

    /**
     * Adds the right storage listener to this object
     * @function TurnOffSlider#addStorageListener
     * @inner
     */
    addStorageListener(){
        new StorageListener(changes => {
            if (constants.tds_settings in changes) {
                chrome.extension.getBackgroundPage().console.log('changed')
                let newSettings = UserSettings.deserializeSettings(changes[constants.tds_settings].newValue);
                this.updateSettings(newSettings);
            }
        });
    }

}
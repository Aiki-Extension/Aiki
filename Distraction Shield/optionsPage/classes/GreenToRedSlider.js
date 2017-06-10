import * as constants from "../../constants"
import {logToFile} from '../../modules/logger'


/**
 * class that connects a <.div> with a span and slider together with all the functionality.
 * I.E. changing colour, updating eachother's values and functionality to be added to the html_elements.
 * The structure this class wants to receive is:
 *      <pre>
 *      <.div id=sliderID>, holding all other components
 *          <.input type=range id=sliderID + "-range">
 *          <.span id=sliderID + "-value">
 *      <./div>
 *      </pre>
 *
 * @abstract
 * @class GreenToRedSlider
 * @param sliderID {string} The ID of the sliderDiv
 * @param saveFunction {function} The function that takes the newly updated value and does what is supposed to happen with it
 */
export default class GreenToRedSlider {

    constructor(sliderID, saveFunction) {
        if (new.target === GreenToRedSlider) {
            throw new TypeError("Cannot construct instances directly, GreenToRedSlider is an abstract class");
        }
        this.saveValue = saveFunction;
        this.sliderDiv = $(sliderID);
        this.sliderRange = $(this.sliderDiv.find(sliderID + "-range"));
        this.sliderValue = $(this.sliderDiv.find(sliderID + "-value"));

        this.setOnEventFunc();
    }

    /**
     * sets all event functions for the GreenToRedSlider
     * @function GreenToRedSlider#setOnEventFunc
     * @inner
     */
    setOnEventFunc() {
        this.sliderRange.on('input', () => {
            let inputValue = this.sliderRange.val();
            this.sliderValue.html(this.calculateHours(inputValue));
            this.updateColor(inputValue);
        });

        this.sliderRange.on('mouseup', () => {
            let inputValue = this.sliderRange.val();
            logToFile(constants.logEventType.changed, `${this.constructor.name}`, `${inputValue}`, constants.logType.settings);
            this.saveValue(inputValue);
        });

        this.sliderValue.on('blur', () => {
            this.checkTimeValidity($(this.sliderValue).html());
        });

        this.sliderValue.keydown(event => {
            if (event.keyCode === constants.KEY_ENTER) {
                this.sliderValue.blur();
                event.preventDefault();
            }
        });
    }

    /**
     * Update the colour of the slider according to the inputValue
     * @param {int} inputValue
     * @function GreenToRedSlider#updateColor
     * @inner
     */
    updateColor(inputValue) {
        let maxSliderVal = (this.sliderRange[0]).max;
        let redVal = Math.round(inputValue / maxSliderVal * 120);
        let greenVal = 120 - redVal;
        this.sliderRange.css('background', 'rgb(' + redVal + ', ' + greenVal + ',0)');
    }

    /**
     * sets the updated value to all elements
     * @param {int} val the new value
     * @function GreenToRedSlider#setValue
     * @inner
     */
    setValue(val) {
        this.sliderRange.val(val);
        this.sliderValue.html(this.calculateHours(val));
        this.updateColor(val);
    }

    /**
     * formats a value in minutes to Hours and minutes.
     * @param {int} val the value to be formatted
     * @returns {string} the formatted string
     * @function GreenToRedSlider#calculateHours
     * @inner
     */
    calculateHours(val) {
        let hours = Math.floor(val / 60);
        let minutes = val % 60;
        if (minutes < 10 && hours > 0)
            minutes = "0" + minutes;
        return this.createMessage(hours, minutes, val);
    }

    createMessage(hours, minutes){
        return (hours > 0 ? hours + ":" + minutes + " hours" : minutes + " minute(s)");
    }

    /**
     * function that checks the validity of the value inputted in the editable span
     * @param {string} val string value that was inputted that needs to be checked whether correct
     * @function GreenToRedSlider#checkTimeValidity
     * @inner
     */
    checkTimeValidity(val) {
        let regex = (/(\d+|\d\:\d{2})(?:\s*)(h(?:our)?s?|m(?:inute|in)?s?|$)/m).exec(val);
        if (regex !== null) {
            if (regex[1].match(":")) {
                let split = regex[1].split(":");
                regex[1] = parseInt(split[0]) + parseInt(split[1]) / 60;
            }
            if (regex[1] > 0) {
                if (regex[2].match("hour")) {
                    regex[1] *= 60;
                }
                // round minutes to a valid number.
                regex[1] = Math.round(regex[1]);
                this.setValue(this.sliderRange[0].max < regex[1] ? this.sliderRange[0].max : regex[1]);
            } else {
                this.timeInputError(val);
            }
        } else {
            this.timeInputError(val);
        }
    }

    /**
     * error function to be fired when we fail the checkTimeValidity function
     * @param {string} val string value that was inputted that needs to be checked whether correct
     * @function GreenToRedSlider#timeInputError
     * @inner
     */
    timeInputError(val) {
        this.setValue(this.sliderRange.val());
        chrome.extension.getBackgroundPage().alert("please input a supported time format");
        logToFile(constants.logEventType.failed, 'slider time input', val, constants.logType.settings);
    }
}
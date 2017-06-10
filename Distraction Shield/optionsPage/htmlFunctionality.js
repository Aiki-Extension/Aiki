import * as constants from '../constants'
import * as storage from '../modules/storage/storage'
import * as logger from '../modules/logger'

/**
 * This file contains the specific functionality for the optionsPage and some of its elements, together with some
 * general functions to fire on html_elements.
 * This file holds all javascript functions used by the html_elements like buttons and fields.
 * Here things like, onClicked or onChanged events are monitored
 * @module htmlFunctionality
 */

/* -------------------- Button Click functions ----------------------- */

/**
 * Connects function to onclick property of html_item
 * @method connectButton
 * @memberOf optionsPage
 */
export function connectButton(html_button, method) {
    html_button.on('click', method);
}
/* -------------------- Keypress events ----------------------- */

/**
 * Sets all keypress functions of the optionsPage
 * @method setKeyPressFunctions
 * @memberOf optionsPage
 */
export function setKeyPressFunctions(html_txtFld, submitFunc) {
    submitOnKeyPress(html_txtFld, submitFunc);
}

/**
 * connect function to ENTER key keypress of an html_element
 * @param {html} html_elem
 * @param {function} submitFunc the corresponding function to be fired
 * @method submitOnKeyPress
 * @memberOf optionsPage
 */
function submitOnKeyPress(html_elem, submitFunc) {
    html_elem.keyup((event) => {
        if (event.keyCode === constants.KEY_ENTER) {
            submitFunc();
        }
    });
}

/* -------------------- Logic for the mode selection -------------------- */

/**
 * enables the user to update the mode of the extension and that these settings are synched across the entire extension
 * @param {string} buttonGroup the name of the radiobuttons
 * @method initModeSelection
 * @memberOf optionsPage
 */
export function initModeSelection(buttonGroup) {
    $("input[name=" + buttonGroup + "]").change(() => {
        storage.getSettings((settings_object) => {
            let selectedMode = $("input[name=" + buttonGroup + "]:checked").val();
            if (selectedMode === 'pro') {
                settings_object.mode = constants.modes.pro;
            } else {
                settings_object.mode = constants.modes.lazy;
            }
            storage.setSettings(settings_object);
            logger.logToFile(constants.logEventType.changed, `mode`, `${settings_object.mode.label}`, constants.logType.settings);
        });
    });
}

import {getSettings, setSettings} from '../modules/storage/storage'

/**
 * Module to append dataCollectionFrame to a modal container
 * @module dataCollection
 */

/**
 *
 * @param {JQuery|HTMLElement} modalContainer  should be the html element in which the modal frame will be loaded.
 * @param {boolean} staticModal  can be used to prevent the modal from closing on click or esc
 * @param {function} callback  callback which is called when the modal is closed.
 */
export function showDataCollectionModal(modalContainer, staticModal = false, callback = () => {}) {
    modalContainer.unbind();
    if (staticModal)
        modalContainer.modal({
            backdrop: 'static',
            keyboard: false
        });
    modalContainer.on('shown.bs.modal', () => {
        modalContainer.find('.modal-content').load("../dataCollection/dataCollectionFrame.html", () => {
            initDataConsentButtons(modalContainer);
        });
    }).modal('show');
    modalContainer.on('hidden.bs.modal', () => {
        modalContainer.find('.modal-content').load("../dataCollection/dataCollectionFrame.html");
        callback();
    });
}

/**
 * Inits the checkbox by retrieving the user's current choice on data collection.
 * adds an onchanged listener to the checkbox.
 */
function initDataConsentButtons(modalContainer){
    $("#learn_more").on('click', () => {
        modalContainer.find('.modal-body').load("../dataCollection/dataCollectionInfo.html");
    });
    getSettings(settings_object => {
        let allowBox = $("#allowBox");
        allowBox.prop('checked', settings_object.collectData);
        allowBox.change(() => {
            setDataCollection($('#allowBox').is(':checked'));
        });
    })

}

/**
 * Retrieves the current settings from storage, changes the data collection parameter and stores it.
 * @param bool {boolean} the new value for the data collection parameter.
 */
function setDataCollection(bool){
    getSettings(settings_object => {
        settings_object.collectData = bool;
        setSettings(settings_object);
    })
}
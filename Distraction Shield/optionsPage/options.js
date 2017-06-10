import * as blockedSiteBuilder from '../modules/blockedSiteBuilder'
import {openTabSingleton} from '../modules/browserutil'
import * as storage from '../modules/storage/storage'
import StorageListener from "../modules/storage/StorageListener"
import UserSettings from '../classes/UserSettings'
import BlockedSiteList from '../classes/BlockedSiteList'
import BlacklistTable from './classes/BlacklistTable'
import IntervalSlider from './classes/IntervalSlider'
import TurnOffSlider from './classes/TurnOffSlider'
import * as connectDataToHtml from './connectDataToHtml'
import * as htmlFunctionality from './htmlFunctionality'
import {feedbackLink, tds_blacklist, tds_settings, tds_interceptCounter} from '../constants'
import {showDataCollectionModal} from '../dataCollection/dataCollection'

/**
 * This file contains the core functions of the options page. this has all the local variables,
 * initializes everything javascript related and connects the syncStorage,
 * connectDataToHtml, blacklistTable and HtmlFunctionality
 * to one smoothly running file. Besides the initialization it contains the functions to manipulate the local variables
 * found here
 * @mixin optionsPage
 */

/** String with the id of the mode-selection radio-button group
 * @type {string}
 * @memberOf optionsPage*/
let modeGroup = "modeOptions";

/** Link to the {@link BlacklistTable} on this page
 * @type {BlacklistTable}
 * @memberOf optionsPage*/
let blockedSiteListTable;

/** Link to the {@link IntervalSlider} on this page
 * @type {IntervalSlider}
 * @memberOf optionsPage*/
let intervalSlider;

/**Link to the {@link TurnOffSlider} at this page.
 * @type {TurnOffSlider}
 * @memberOf optionsPage*/
let turnOffSlider;

/* -------------------- Initialization of options --------------------- */

document.addEventListener("DOMContentLoaded", function () {
    initOptionsPage();
});

/**
 * Initial function that is fired when the page is loaded. It initialize HTML elements and set the local variables
 * @method initOptionsPage
 * @memberOf optionsPage
 */
function initOptionsPage() {
    storage.getAll(function (output) {
        connectHtmlFunctionality();
        connectStorageDataToHtml(output);
    });
}

/**
 * connect the functionality to the different html_elements on the optionspage.
 * @method connectHtmlFunctionality
 * @memberOf optionsPage
 */
function connectHtmlFunctionality() {
    htmlFunctionality.initModeSelection(modeGroup);
    intervalSlider = new IntervalSlider('#interval-slider');
    blockedSiteListTable = new BlacklistTable($('#blacklistTable'));
    turnOffSlider = new TurnOffSlider('#turnOff-slider');
    htmlFunctionality.connectButton($('#turnOff-slider-offBtn'), turnOffSlider.offButtonFunc);
    htmlFunctionality.connectButton($('#saveBtn'), saveNewUrl);
    htmlFunctionality.connectButton($('#statisticsLink'), openStatisticsPage);
    htmlFunctionality.connectButton($('#feedbackButton'), openFeedbackForm);
    htmlFunctionality.connectButton($('#tourRestartButton'), restartTour);
    htmlFunctionality.connectButton($('#dataSettingsButton'), openDataCollectionConsent);
    htmlFunctionality.setKeyPressFunctions($('#textFld'), saveNewUrl);
}

/**
 * connect the data found in the storage to the html_elements on the page
 * @param storage_output output received by a get all request from the storage
 * @method connectStorageDataToHtml
 * @memberOf optionsPage
 */
function connectStorageDataToHtml(storage_output) {
    loadInterceptionCounter(storage_output.tds_interceptCounter);
    loadBlockedSiteList(storage_output.tds_blacklist);
    loadSettings(storage_output.tds_settings);
}

/**
 * Connect the {@link BlockedSiteList} to the {@link BlacklistTable}.
 * @param {BlockedSiteList} blockedSiteList
 * @method loadBlockedSiteList
 * @memberOf optionsPage
 */
function loadBlockedSiteList(blockedSiteList){
    connectDataToHtml.loadHtmlBlacklist(blockedSiteList, blockedSiteListTable);
}

/**
 * Connect the settings object to the different parts of the optionsPage
 * @param {UserSettings} settings_object
 * @method loadSettings
 * @memberOf optionsPage
 */
function loadSettings(settings_object){
    connectDataToHtml.loadHtmlMode(settings_object.mode, modeGroup);
    connectDataToHtml.loadHtmlInterval(settings_object.interceptionInterval, intervalSlider);
}

/**
 * set the value of the interceptioncounter at the top of the page
 * @param {int} val
 * @method loadInterceptionCounter
 * @memberOf optionsPage
 */
function loadInterceptionCounter(val){
    connectDataToHtml.loadHtmlInterceptCounter(val, $('#iCounter'));
}

/**
 * reloads the BlockedSiteList in the BlacklistTable by comparing it to the old value
 * @param {BlockedSiteList} blockedSiteList
 * @param {BlockedSiteList} oldBlockedSiteList
 * @method reloadTable
 * @memberOf optionsPage
 */
function reloadTable(blockedSiteList, oldBlockedSiteList) {
    connectDataToHtml.reloadHtmlBlacklist(blockedSiteList, oldBlockedSiteList, blockedSiteListTable);
}

/* -------------------- Manipulate local variables ------------------- */

/**
 * clears the error message box
 * @method resetMessageBox
 * @memberOf optionsPage
 */
function resetMessageBox() {
    let messageBox = $('#message-box');
    messageBox.text('');
    messageBox.show();

}

/* -------------------- Act upon change of storage ------------------- */

/**
 * This function should be called onChange, this checks if it needs to act on the storage change.
 * @param changes {Array} array of objects in storage that have been changed. Contains new & old value
 * @method onStorageChanged
 * @memberOf optionsPage
 */
new StorageListener((changes) => {
    if (tds_blacklist in changes) {
        let newBlockedSiteList = BlockedSiteList.deserializeBlockedSiteList(changes[tds_blacklist].newValue);
        let oldBlockedSiteList = BlockedSiteList.deserializeBlockedSiteList(changes[tds_blacklist].oldValue);
        reloadTable(newBlockedSiteList,oldBlockedSiteList);
    } if (tds_settings in changes) {
        let newSettings = UserSettings.deserializeSettings(changes[tds_settings].newValue);
        loadSettings(newSettings);
    } if (tds_interceptCounter in changes) {
        loadInterceptionCounter(changes[tds_interceptCounter].newValue);
    }
});

/* -------------------- Manipulate local variables ------------------- */

/**
 * Is called when we hit enter or click save upon saving a new url
 * @method saveNewUrl
 * @memberOf optionsPage
 */
function saveNewUrl() {
    resetMessageBox();
    let html_txtFld = $('#textFld');
    let newUrl = html_txtFld.val();
    blockedSiteBuilder.createBlockedSiteAndAddToStorage(newUrl)
        .catch(error => {$('#message-box').text(error).fadeOut(8000, resetMessageBox)});
    html_txtFld.val('');
}

/* -------------------- -------------------------- -------------------- */

/**
 * Opens the feedback form for users
 * @method openFeedbackForm
 * @memberOf optionsPage
 */
function openFeedbackForm() {
    openTabSingleton(feedbackLink);
}

/**
 * restarts the intro tour
 * @method restartTour
 * @memberOf optionsPage
 */
function restartTour() {
    chrome.tabs.getCurrent(tab => {
        if (!tab)
            openTabSingleton(chrome.runtime.getURL('introTour/introTour.html'));
        else
            chrome.tabs.update(tab.id, {url: chrome.runtime.getURL('introTour/introTour.html')});
    })
}

/**
 * opens up the page with user statistics
 * @method openStatisticsPage
 * @memberOf optionsPage
 */
function openStatisticsPage() {
    openTabSingleton(chrome.runtime.getURL('statisticsPage/statistics.html'));
}

/**
 * This function loads the button functionality for the modal. This can only be loaded when the modal is shown,
 * since the html is added dynamically
 * @method openDataCollectionConsent
 * @memberOf optionsPage
 */
export function openDataCollectionConsent(){
    showDataCollectionModal($('#dataConsentModal'));
}

import * as constants from '../constants'
import * as storage from '../modules/storage/storage'


/**
 * This module injects html to all content script matches in the manifest.
 * @module inject
 */

/**
 * Check if we have come here after tds redirection, if not return, if so get mode and inject html.
 */
function mainFlow() {
    if (!constants.tdsRedirectRegex.test(window.location.href)) return;
    storage.getMode(initBasis);
}

/**
 * Initialize the tds info panel with the proper text based on mode
 * @param {modes} mode used to set the text for the generalInfoText
 */
function initBasis(mode) {
    let message = mode.zeeguuText;
    $.ajax({
        url: chrome.extension.getURL('contentInjection/inject.html'),
        type: "GET",
        timeout: 5000,
        datatype: "html",
        success: function (data) {
            let infoDiv = $.parseHTML(data);
            $("body").after(infoDiv);
            $("#tds_infoDiv").css('max-width', '800px');
            $("#tds_generalInfoText").append(constants.zeeguuInfoText);

            if (window.location.href.indexOf(constants.zeeguLoginLink) != -1) {
                if (mode.label == constants.modes.pro.label) {
                    message = constants.loginMessage;
                } else {
                    message = message +"\n" + constants.loginMessage;
                }
            }
            $("#tds_modeSpecificText").append(message);

            $("#originalDestination").attr("href", extractDestination());
            $("#aikido").attr("src",chrome.extension.getURL('aikido.png'));
        }
    });
}

/**
 * This function extracts the original destination from a get parameter in the current url
 * @returns {String} newUrl The url of the original destination plus a
 * get parameter indicating that the zeeguu exercise was completed. Should never return null!
 */
function extractDestination() {
    let url = window.location.href;
    let results = constants.tdsRedirectRegex.exec(url);
    if (!results || !results[1]) { return null; }
    let newUrl = decodeURIComponent(results[1]);//prevent errors in browsers that dont decode
    newUrl += (/[?]/.test(newUrl) ? "&" : "?") + "tds_exComplete=true";
    return newUrl;
}

mainFlow();
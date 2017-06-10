/**
 * <pre>
 * General module which contains two functionalities:
 *      1.  It takes string versions of url's and strips them of certain
 *          parts in the url, we do this in order to be able
 *          to format them so we can do GET-requests with them.
 *      2.  We fire the aforementioned GET-request in order to retrieve
 *          an end-point url of a given url. In other words we retrieve
 *          the url we'd find when we type this into the address bar.
 * </pre>
 * It is used throughout the extension by calling the blockedSiteBuilder module. This builder will use this module in order
 * to build the correct blockedSite.
 * @module urlFormatter
 */

import * as constants from '../constants';

/**
 * removes trailing space from url, if nothing is there returns url
 * @param {string} url to strip
 * @returns {string} the newly formatted url
 * @method stripOfFinalSlash
 */
export function stripOfFinalSlash(url) {
    if (url[url.length - 1] == '/') {
        url = url.slice(0, url.length - 1);
    }
    return url;
}

/**
 * removes scheme from url, if nothing is there returns url
 * @param {string} url to strip
 * @returns {string} the newly formatted url
 * @method stripOfScheme
 */
export function stripOfScheme(url) {
    let schemeless = url;
    if (url.indexOf("://") > -1) {
        schemeless = url.split('://')[1];
    }
    schemeless = stripOfFinalSlash(schemeless);
    return schemeless;
}

/**
 * removes port from url, if nothing is there returns url
 * @param {string} url to strip
 * @returns {string} the newly formatted url
 * @method stripOfPort
 */
export function stripOfPort(url) {
    let portless = [];
    if (url.indexOf(":") > -1) {
        let splittedUrl = url.split(':');
        portless.push(splittedUrl[0]);
        splittedUrl.shift();
        splittedUrl = splittedUrl[0].split('/');
        splittedUrl.shift();
        splittedUrl = splittedUrl.join('/');
        portless.push('/' + splittedUrl + '/');
        url = portless.join("");
    }
    url = stripOfFinalSlash(url);
    return url;
}

/**
 * removes filename from url, if nothing is there returns url
 * @param {string} url to strip
 * @returns {string} the newly formatted url
 * @method stripOfFileName
 */
export function stripOfFileName(url) {
    if (url.indexOf("/") > -1) {
        let nameless = url.split("").reverse().join("");
        nameless = nameless.split(['/']);
        let stripped = [];
        for (let i = 1; i < nameless.length; i++) {
            stripped.push('/');
            stripped.push(nameless[i]);
        }
        stripped = stripped.join("").split("").reverse().join("");
        stripped = stripOfFinalSlash(stripped);
        return stripped;
    } else {
        url = stripOfFinalSlash(url);
        return url;
    }
}

/**
 * @param {string} url the url of which we want the domain
 * @returns {string} the domain
 * @method getDomainOnly
 * @private
 */
function getDomainOnly(url) {
    if (url.indexOf("/") > -1) {
        return url.split("/")[0];
    } else {
        return url;
    }
}

/**
 * removes scheme, final slash, port and filename from url, returns tuple of new url and the domain of the url
 * @param {string} url to strip of all
 * @returns {array} a tuple of the actual url and only the domain=: "www.website.com"
 * @method stripOfAll
 */
export function stripOfAll(url) {
    url = stripOfScheme(url);
    url = stripOfFinalSlash(url);
    url = stripOfPort(url);
    url = stripOfFileName(url);
    url = stripOfFinalSlash(url);
    return [url, getDomainOnly(url)];
}

/**
 * @param {string} url the url to be formatted
 * @returns {string} the formatted url
 * @method formatForGetRequest
 * @private
 */
function formatForGetRequest(url) {
    let strippedUrl = stripOfAll(url);
    return "http://" + strippedUrl[0];
}

/**
 * fires any valid url and gets the end destination's url and page title. These are passed as arguments in the callback
 * @param {string} url the url to check
 * @param {function} onSuccess the callback function that takes the newly formatted end-url together with it's page title as argument. This results in resolving the promise
 * @param {function} onFailure the callback function that when we encounter an error during the asynchronous request. This results in rejecting the promise
 * Used in the BlockedSiteBuilder
 * @method getUrlFromServer
 */
export function getUrlFromServer(url, onSuccess, onFailure) {
    let urlToGet = formatForGetRequest(url);
    let resolve = function (url, title) {
        url = stripOfScheme(url);
        url = stripOfFileName(url);
        onSuccess(url, title);
    };
    httpGetAsync(urlToGet, resolve, onFailure);
}

/**
 * @param {string} theUrlToGet the url to get
 * @param {function} onSuccess the callback function that takes the newly formatted end-url together with it's page title as argument. This results in resolving the promise
 * @param {function} onFailure the callback function that when we encounter an error during the asynchronous request. This results in rejecting the promise
 * fire asynchronous get request to find the end port of the passed url
 * @method httpGetAsync
 */
function httpGetAsync(theUrlToGet, onSuccess, onFailure) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrlToGet, true); // true for asynchronous
    xmlHttp.onreadystatechange = function () {
        readyStateChange(xmlHttp, onSuccess, onFailure);
    };
    xmlHttp.send(null);
}

/**
 * @param {XMLHttpRequest} xmlHttp the xmlhttprequest to fire
 * @param {function} onSuccess the callback function that takes the newly formatted end-url together with it's page title as argument. This results in resolving the promise
 * @param {function} onFailure the callback function that when we encounter an error during the asynchronous request. This results in rejecting the promise
 * function to be passed to the get-request
 * @method readyStateChange
 * @private
 */
function readyStateChange(xmlHttp, onSuccess, onFailure) {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        // simple regex to extract data from title tags, ignoring newlines, tabs and returns
        let titleTags = (/<title.*?>(?:[\t\n\r]*)([\w\W]*?)(?:[\t\n\r]*)<\/title>/m).exec(xmlHttp.responseText);
        if (titleTags != null) {
            let title = titleTags[1];
            onSuccess(xmlHttp.responseURL, title);
        } else {
            onSuccess(xmlHttp.responseURL, theUrlToGet);
        }
    } else if (xmlHttp.readyState == 4) {
        onFailure(errorHandler(xmlHttp.status));
    }
}

/**
 * internal error handler
 * @method errorHandler
 * @private
 */
function errorHandler(status) {
    switch (status) {
        case constants.FILE_NOT_FOUND_ERROR:
            return (constants.INVALID_URL_MESSAGE + 'File not found');
            break;
        case constants.SERVER_ERROR:
            return (constants.INVALID_URL_MESSAGE + 'Server error');
            break;
        case constants.REQUEST_ABORTED_ERROR:
            return (constants.INVALID_URL_MESSAGE + 'Request aborted');
            break;
        default:
            return (constants.INVALID_URL_MESSAGE + 'Unknown error ' + status);
    }
}
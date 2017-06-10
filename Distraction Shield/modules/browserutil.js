/**
 * This module has some functions we'd like to have in the browser, for special casing things like opening a tab or
 * modifying user-history
 * @module browserutil
 */

/**
 * This function uses the chrome tabs api to see if a tab is open with a certain url.
 * Calls the callback with: the id of the tab if a tab is open with the given url, false otherwise
 * @param {string} url Url to check for
 * @param {function} callback Function to call with the result of the search
 */
export function isOpenTab (url, callback) {
    chrome.tabs.query({},(tabs) => {
        for (let t of tabs) {
            if (t.url == url) {
                callback(t.id);
                return;
            }
        }
        callback(false);
    });
}

/**
 * A function that opens a tab with a given url, only if none is open yet,
 * switches to the already open tab otherwise
 * @param {string} url Url to check for
 * @param {function} callback
 */
export function openTabSingleton(url, callback = () => {}) {
    isOpenTab(url, (result) => {
        if (result === false) {//meaning: tab not yet open
            chrome.tabs.create({url : url});
        } else {
            chrome.tabs.update(result, {active: true});
        }
        callback();
    });
}

/**
 * This function removes (scrubs) all entries in browserhistory that contain the free-text string query
 * @param {String} query
 */
export function scrubFromHistory(query) {
    chrome.history.search({text: query}, (results) => {
        results.forEach((x) => {
            chrome.history.deleteUrl({url: x.url})
        })
    })
}

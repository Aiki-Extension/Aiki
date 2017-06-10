/**
 * This file connects the data we read from storage and saved in local variables
 * to the actual html representations of this data in the optionsPage.
 * @module connectDataToHtml
 */

/**
 * loads the {@link BlockedSiteList} into the {@link BlacklistTable}
 * @param {BlockedSiteList} blockedSiteList
 * @param {BlockedSiteList} table
 * @method loadHtmlBlacklist
 * @memberOf optionsPage
 */
export function loadHtmlBlacklist(blockedSiteList, table) {
    blockedSiteList.forEach(value => {
        table.addToTable(table.generateTableRow(value));
    });
}

/**
 * reloads the BlacklistTable with the new values of the BlockedSiteList
 * @param {BlockedSiteList} newBlockedSiteList
 * @param {BlockedSiteList} oldBlockedSiteList
 * @param {BlacklistTable} table
 * @method reloadHtmlBlacklist
 * @memberOf optionsPage
 */
export function reloadHtmlBlacklist(newBlockedSiteList, oldBlockedSiteList, table) {
    table.render(newBlockedSiteList, oldBlockedSiteList);
}

/**
 * sets the mode from the settingObject in the radioButton group
 * @param {object} extensionMode
 * @param {string} radioGroup
 * @method loadHtmlMode
 * @memberOf optionsPage
 */
export function loadHtmlMode(extensionMode, radioGroup) {
    $("input[name=" + radioGroup + "][value=" + extensionMode.label + "]").prop('checked', true);
}

/**
 * Sets the interceptionInterval from the settings to the {@link IntervalSlider}
 * @param {int} interceptInterval
 * @param {IntervalSlider} html_slider
 * @method loadHtmlInterval
 * @memberOf optionsPage
 */
export function loadHtmlInterval(interceptInterval, html_slider) {
    html_slider.setValue(interceptInterval);
}

/**
 * Sets the value of the html_counter, span, to a new value
 * @param {int} count
 * @param {html} html_counter
 * @method loadHtmlInterceptCounter
 * @memberOf optionsPage
 */
export function loadHtmlInterceptCounter(count, html_counter) {
    html_counter.text(count);
}
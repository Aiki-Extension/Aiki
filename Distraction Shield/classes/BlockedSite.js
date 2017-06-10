import * as constants from '../constants';

export default class BlockedSite {
    /**
     * Basic datatype of the extension. One BlockedSite instance represents one website that the user wants to block.
     * @param {string} urlBase Domain of the BlockedSite
     * @param {string} title Title of the BlockedSite
     * @constructs BlockedSite
     * @class
     */
    constructor(urlBase, title) {
        /** @member {string} BlockedSite#url String with url formatted in the way the google API uses them for webRequest listeners. \n
         *  I.E. " http://www.facebook.com " -> " *://www.facebook.com/* "
         */
        this._url = this.constructUrl(urlBase);
        /** @member {string} BlockedSite#domain Nice (displayable to the user) version of the url field*/
        this._domain = urlBase;
        /** @member {string} BlockedSite#title Title of the tab we find if we were to go to the endpoint of this url*/
        this._name = title;
        /** @member  {string} BlockedSite#icon Html-code which gets the favicon of the page*/
        this._icon = this.constructIcon(urlBase);
        /** @member {boolean} BlockedSite#checkboxVal Is interception enabled for this blockedSite?*/
        this._checkboxVal = true;
        /** @member {int} BlockedSite#counter How many times were we intercepted from this page */
        this._counter = 0;
        /** @member {int} BlockedSite#timeSpent How much time did we waste on this website */
        this._timeSpent = 0;
    }

    /**
     * returns url regex
     * @param url
     * @returns {string} formatted url
     * @function BlockedSite#constructUrl
     */
    constructUrl(url) {
        return "*://" + url + "/*";
    }

    /**
     * @param url
     * @returns {string} html string for url's favicon
     * @function BlockedSite#constructIcon
     */
    constructIcon(url) {
        return "<img style=\"-webkit-user-select: none\" src=\"" + constants.FAVICONLINK + url + "\">"
    }

    set url(url) { this._url = url; }
    get url() { return this._url; }

    set domain(domain) { this._domain = domain; }
    get domain() { return this._domain; }

    set icon(icon) { this._icon = icon; }
    get icon() { return this._icon; }

    set name(name) { this._name = name; }
    get name() { return this._name; }

    set counter(counter) { this._counter = counter; }
    get counter() { return this._counter; }

    set timeSpent(timeSpent) { this._timeSpent = timeSpent; }
    get timeSpent() { return this._timeSpent; }

    set checkboxVal(checkboxVal) { this._checkboxVal = checkboxVal; }
    get checkboxVal() { return this._checkboxVal; }


    /* --------------- --------------- Serialization --------------- --------------- */

    /**
     * @param {BlockedSite} blockedSite BlockedSite to serialize
     * @returns {string} stringified blockedsite
     * @function BlockedSite#serializeBlockedSite
     */
    static serializeBlockedSite(blockedSite) {
        return JSON.stringify(blockedSite);
    }

    /**
     * Parses the JSON object to a BlockedSite object
     * @param {JSON} blockedSite BlockedSite to parse
     * @returns {BlockedSite} parsed Blocked Site
     * @function BlockedSite#parseBlockedSite
     */

    static parseBlockedSite(blockedSite) {
        let b = new BlockedSite();
        b.url = blockedSite._url;
        b.domain = blockedSite._domain;
        b.name = blockedSite._name;
        b.icon = blockedSite._icon;
        b.checkboxVal = blockedSite._checkboxVal;
        b.counter = blockedSite._counter;
        b.timeSpent = blockedSite._timeSpent;
        return b;
    }

    /**
     * This parses a JSON string to a BlockedSite Object
     * @param serializedBlockedSite {string} JSON string containing the BlockedSite
     * @returns {BlockedSite | null} Deserialized BlockedSite
     * @function BlockedSite#deserializeBlockedSite
     */

    static deserializeBlockedSite(serializedBlockedSite) {
        if(serializedBlockedSite != null) {
            let parsed = JSON.parse(serializedBlockedSite);
            return BlockedSite.parseBlockedSite(parsed);
        }
        return null;
    }

}
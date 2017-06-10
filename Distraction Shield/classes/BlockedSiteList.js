import BlockedSite from '../classes/BlockedSite'

export default class BlockedSiteList extends Array {

    /**
     * @constructs BlockedSiteList
     * @class
     */
    constructor() {
        super();
        this.__proto__ = BlockedSiteList.prototype;
    }

    get urls() {
        if (this != []) {
            return this.map(function (bs) {
                return bs.url;
            });
        }
        return [];
    }

    get activeUrls() {
        if (this != []) {
            let urlList = this.filterOnChecked();
            if (urlList != []) {
                return urlList.map(function (bs) {
                    return bs.url;
                });
            }
        }
        return [];
    }

    /**
     * Adds the BlockedSite if this doesn't exist in the list yet.
     * @param newBlockedSite {BlockedSite} {@link BlockedSite} to be added
     * @returns {boolean} Returns true if added to the list
     * @function BlockedSiteList#addToList
     */
    addToList(newBlockedSite) {
        let currentUrls = this.urls;
        let unique = currentUrls.every(function (urlFromList) {
            return urlFromList != newBlockedSite.url;
        });
        if (unique) {
            this.push(newBlockedSite);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Adds all BlockedSites to the list
     * @param blockedSiteList {BlockedSiteList} {@link BlockedSite} to be added
     * @function BlockedSiteList#addAllToList
     */
    addAllToList(blockedSiteList) {
        for (let i = 0; i < blockedSiteList.length; i++) {
            this.addToList(blockedSiteList[i]);
        }
    }

    /**
     * removes BlockedSite from the list
     * @param blockedSiteToDelete {BlockedSite}
     * @function BlockedSiteList#removeFromList
     */
    removeFromList(blockedSiteToDelete) {
        let index = this.map(function(e) { return e.domain; }).indexOf(blockedSiteToDelete.domain);
        this.splice(index, 1);
    }

    /**
     * Takes a BlockedSite and updates the corresponding match in the BlockedSiteList
     * @param blockedSite {BlockedSite} BlockedSite to update
     * @function BlockedSiteList#updateInList
     */
    updateInList(blockedSite){
        this.forEach((item, id) => {
            if (item.url === blockedSite.url)
                this[id] = blockedSite;
        });
    }

    /**
     * Filters BlockedSiteList based on checkboxVal of {@link BlockedSite}
     * @returns {BlockedSiteList} filtered BlockedSiteList
     * @function BlockedSiteList#filterOnChecked
     */
    filterOnChecked() {
        if (this != []) {
            return this.filter(function (a) {
                return a.checkboxVal == true;
            });
        }
        return [];
    }

    /* --------------- --------------- Serialization --------------- --------------- */

    /**
     * @param {BlockedSiteList} blockedSiteList BlockedSiteList to serialize
     * @returns {string} stringified BlockedSiteList
     * @function BlockedSiteList#serializeBlockedSiteList
     */
    static serializeBlockedSiteList(blockedSiteList) {
        let toSerialize = blockedSiteList.map(BlockedSite.serializeBlockedSite);
        return JSON.stringify(toSerialize);
    }

    /**
     * Parses the JSON blockedSiteList to a BlockedSiteList object
     * @param {JSON} blockedSiteList BlockedSiteList to parse
     * @returns {BlockedSiteList} parsed BlockedSiteList
     * @function BlockedSiteList#parseBlockedSite
     */
    static parseBlockedSiteList(blockedSiteList) {
        let bl = new BlockedSiteList();
        bl.addAllToList(blockedSiteList);
        return bl;
    }

    /**
     * This parses a JSON string to a BlockedSiteList Object
     * @param serializedBlockedSiteList {string} JSON string containing the BlockedSiteList
     * @returns {BlockedSiteList | null} Deserialized BlockedSiteList
     * @function BlockedSiteList#deserializeBlockedSiteList
     */
    static deserializeBlockedSiteList(serializedBlockedSiteList) {
        if (serializedBlockedSiteList != null) {
            let parsed = JSON.parse(serializedBlockedSiteList);
            parsed = parsed.map(BlockedSite.deserializeBlockedSite);
            return BlockedSiteList.parseBlockedSiteList(parsed);
        }
        return null;
    }

}
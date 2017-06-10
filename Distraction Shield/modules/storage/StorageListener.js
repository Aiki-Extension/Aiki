
export default class StorageListener {
    /**
     * Adds a listener which listens for changes in the storage. Page that use data from the storage and need
     * to be updated on change, will implement a function that defines what to do with the changes and pass
     * it on to the constructor of this class. This method will then fire upon the change of storage.
     * @param {function} handleStorageChange The function to fired that takes as parameter the data from the onChanged event
     * @constructs StorageListener
     * @class
     */
    constructor(handleStorageChange) {
        chrome.storage.onChanged.addListener(changes => {
            handleStorageChange(changes)
        });
    }
}
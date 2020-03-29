import firebase from "./fire";

/* global chrome */
let listeners = [];
let historicalData = "a"

export function getFromStorage(...keys) {
    return new Promise(resolve => {
        if (window.chrome && chrome.storage) {
            chrome.storage.sync.get(keys, result => {
                resolve(result);
            });
        } else {
            let result = keys.reduce((acc, val) => {
                try {
                    acc[val] = JSON.parse(localStorage.getItem(val));
                } catch (e) {
                    // too bad, could not retrieve this value. fail safe.
                    // the value is probably invalid json for some reason,
                    // such as 'undefined'.
                }
                return acc;
            }, {});

            resolve(result);
        }
    });
}

export const addStorageListener = callback => {
    if (window.chrome && chrome.storage) {
        chrome.storage.onChanged.addListener(callback);
    } else {
        listeners.push(callback);
        window.addEventListener('storage', callback); // only for external tab
    }
};

export function setInStorage(items) {
    return new Promise(async resolve => {
        if (!items) return resolve();
        
        if (window.chrome && chrome.storage) {
            chrome.storage.sync.set(items, () => {
                resolve();
            });
        } else {
            Object.keys(items).forEach(key => {
                // don't store null or undefined values.
                if (items[key] === undefined || !items[key] === null) {
                    return;
                }

                localStorage.setItem(key, JSON.stringify(items[key]));
            });
            listeners.forEach(callback => callback());

            resolve();
        }
    });
}

export async function setHistoricalFirebase(items) {
    if(!items) return;

    chrome.storage.sync.get(['userid', 'firstRun'], async res => {
        var first = res.firstRun;
        var uId = res.userid;

        if(first){
            firstTimeRunStorage(uId);
            chrome.storage.sync.set({'firstRun': false})
        }
        
        let timeStamp = [new Date().getTime()];

        timeStamp.push(items);

        await firebase.firestore().collection(historicalData).doc(uId).update({
            [timeStamp[0]]: timeStamp[1]
        });
    });    
}

export function firstTimeRunStorage(UUID) {
    return new Promise(async resolve => {
            await firebase.firestore().collection(historicalData).doc(UUID).set({
            }).catch(console.error);
            resolve();
    });
}

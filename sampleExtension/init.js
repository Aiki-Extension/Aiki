
/* --------------- ---- Session initializer ---- ---------------*/

//First receive the blacklist and settings from the sync storage,
//then create a onBeforeRequest listener using this list and the settings.
initSession = function () {
    // Settings need to be loaded before the listener is replaced. The replaceListener
    // requires the blocked sites to be loaded, so these weird callbacks are required.
    storage.getSettings(function(settings) {
        settings.reInitTimer();
        setLocalSettings(settings);
        retrieveBlockedSites(replaceListener);
    });
    retrieveInterceptDateList();
};

/* --------------- ---- Run upon installation ---- ---------------*/

chrome.runtime.onInstalled.addListener(function() {
    storage.getAll( function(output) {
        initBlacklist(output.tds_blacklist);
        initInterceptCounter(output.tds_interceptCounter);
        initInterceptDateList(output.tds_interceptDateList);
        initSettings(output.tds_settings);
    });
});

initInterceptCounter = function(counter) {
    if (counter == null) {
        storage.setInterceptionCounter(0);
    }
};

initInterceptDateList = function(dateList) {
    if (dateList == null) {
        storage.setInterceptDateList(dateList);
    }
};

initBlacklist = function(list) {
    if (list == null) {
        blacklistToStore = new BlockedSiteList();
        storage.setBlacklist(blacklistToStore);
    }
};

initSettings = function(settings) {
    if (settings == null) {
        settingsToStore = new UserSettings();
        storage.setSettingsWithCallback(settingsToStore, initSession);
    }
};


/* --------------- ---- Run upon Start of session ---- ---------------*/

//fix that checks whether everything that should be is initialized
storage.getSettings(function(settings) {
    if (settings != null) {
        initSession();
    }
});
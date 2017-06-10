/**
 * All the constants used throughout the extension
 * @module constants
 */

/* ---------- ----- background ----- ---------- */

/* ---------- ----- background ----- ---------- */
export const zeeguuExLink = "https://www.zeeguu.unibe.ch/practice/get-ex";

export const zeeguuExTracker = "www.zeeguu.unibe.ch/practice/get-ex";

export const exerciseCompleteRegex = /(\?|&)tds_exComplete=true/;

export const exerciseCompleteParam = "tds_exComplete=true";

export const tdsRedirectParam = "?tds_redirect=";

/* ---------- ----- optionspage----- ---------- */
export const feedbackLink = "https://docs.google.com/forms/d/e/1FAIpQLScHTpTaGD19HJd4d7k98FV_20-NwRV0dp9xNMWza7_1KsiGag/viewform";

/* ---------- ----- BlockedSite ----- ---------- */
export const FAVICONLINK = "https://www.google.com/s2/favicons?domain=";

/* ---------- ----- export constants for statistics ----- ---------- */

// The time in seconds after which a user is considered to be idle. Important for tracking the amount of time spent on a url.
// Minimum value is 15 seconds.
export const idleTime = 15;

// The frequency in minutes after which the tracker statistics are being saved into the storage.
export const trackerAlarmFrequency = 1.0;

/* ---------- ----- UserSettings, inject ----- ---------- */
/**
 * Extension interception modes.
 * @readonly
 * @enum {lazy | pro} mode
 */
export const modes = {
    lazy: {
        label: "lazy",
        zeeguuText: "You are in lazy mode. Click <a id='originalDestination'>'Skip'</a> any time to continue browsing."
    },
    pro: {
        label: "pro",
        zeeguuText: "You are in pro mode. Complete the exercise and click the 'Take me away!' button when you are done to continue browsing."
    }
};

export const zeeguLoginLink = "https://www.zeeguu.unibe.ch/login";

export const tdsRedirectRegex = /[?]tds_redirect=(.*)/;

export const loginMessage = "Please log in to get productive!";


/* ---------- ----- BlockedSiteList ----- ---------- */
export const newUrlNotUniqueError = "Oops! You already blocked this website: ";

/* ---------- ----- Whitelist ----- ----- ---------- */

/**
 * A list of regexp's. If a url matches one of these it is not supposed to beblocked
 * @type {RegExp[]}
 */
export const whitelist = [
    "_\/chrome\/newtab",
    "oauth.*\?.*client_id",
    "zeeguu.unibe.ch"
];

/* ---------- ----- urlFormatter ----- ---------- */
export const INVALID_URL_MESSAGE = "We unfortunately could not reach the site you are trying to block.\n" +
    "Are you sure the url is correct? \n \n";

export const FILE_NOT_FOUND_ERROR  = 404;
export const SERVER_ERROR = 500;
export const REQUEST_ABORTED_ERROR = 0;

/* -------------------- Logger constants ----------------------- */
// time interval in minutes between sending data to server
export const LOGGING_INTERVAL = 1440;
// time delay between first use of extension and data logging
export const LOGGING_ALARM_DELAY = 720;

/**
 * Logger event types.
 * @readonly
 * @enum {string} event type
 */
export const logEventType = {
    changed:'changed',
    intercepted:'intercepted',
    spent:'spent',
    failed:'failed'
};

/**
 * Log types.
 * @readonly
 * @enum {string} log type
 */

export const logType = {
    statistics:'statistics',
    settings:'settings'
};

/* -------------------- Text Messages ----------------------- */
export const zeeguuInfoText = "Hey, you tried to enter one of the sites you wanted to be protected from!";

/* -------------------- Keypress export constants ----------------------- */
/* ---------- ----- optionsPage/htmlFunctionality ----- ---------- */
export const KEY_ENTER = 13;



/* -------------------- Number export constants ----------------------- */
// The amount of milliseconds in one day
export const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

/* ---------- ----- turnoffSlider ----- ---------- */
export const MAX_TURN_OFF_TIME = 480;

/* ---------- ----- Storage constants ----- ---------- */
export const tds_all = null;
export const tds_blacklist = "tds_blacklist";
export const tds_settings = "tds_settings";
export const tds_interceptCounter = "tds_interceptCounter";
export const tds_interceptDateList = "tds_interceptDateList";
export const tds_exerciseTime = "tds_exerciseTime";
export const tds_logs = "tds_logs";
export const tds_logfile = "tds_logfile";

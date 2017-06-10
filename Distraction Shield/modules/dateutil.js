/**
 * This module is an utility to help get the correct format for dates which are used in the codebase.
 * @module dateutil
 */


/**
 * Converts milliseconds to HH:MM:SS format
 * @param {int} ms amount of milliseconds
 */
export function msToHHMMSS(ms) {
    return new Date(ms).toISOString().substr(11, 8);
}

/**
 * Converts date object to string format
 * @param {Date} date date object to format
 */
export function formatDate(date) {
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
}

/**
 * returns the current date, formatted in the correct format.
 */
export function getToday() {
    let dateObject = new Date();
    return formatDate(dateObject);
}

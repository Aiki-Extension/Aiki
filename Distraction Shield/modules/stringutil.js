/**
 * This module is a utility that is used for functions we use in more than one place in order to do things like comparison
 * @module stringutil
 */

/**
 * used to compare if a string is a substring of, with ReqExp
 * @param {string} str compared with rule
 * @param {string} rule compare str to this
 * @method wildcardStrComp
 */
export function wildcardStrComp(str, rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}

/**
 * This function checks if a string url is in a given list of regexes.
 * @see {module:constants.whitelist}
 * @param {RegExp[]} regexList the list to check against
 * @param {String} url The string to check against the regexp's in regexList
 * @returns {Boolean} True if url matches one of the regexp's in regexList, false otherwise
 * @method isInRegexList
 */
export function isInRegexList(regexList, url) {
    regexList = regexList.map((x) => { return new RegExp(x) });
    let matches = regexList.map((x) => { return x.test(url) });
    return matches.reduce((x, y) => { return x || y });
}
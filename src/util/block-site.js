/* global chrome */
import { message } from 'antd';
import Autolinker from 'autolinker';
import UrlParser from 'url-parse';
import parseDomain from 'parse-domain';
import { getFromStorage, setInStorage, setHistoricalFirebase } from './storage';
import { defaultExerciseSites } from './constants';

export async function getWebsites() {
    const res = await getFromStorage('blockedUrls');
    return res.blockedUrls || [];
}

export const blockCurrentWebsite = () => {
    if (!(window.chrome && chrome.tabs)) return; // no chrome env.

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tab = tabs[0];
        blockWebsite(tab.url).then(() => {
            chrome.tabs.reload(tab.id);
        });
    });
}

export const unBlockCurrentWebsite = () => {
    if (!(window.chrome && chrome.tabs)) return; // no chrome env.

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let tab = tabs[0];
        let hostname = new UrlParser(tab.url).hostname;
        unblockWebsite(hostname);
    });
}

export const isCurrentWebsiteBlocked = () => {
    return new Promise((resolve) => {
        if (!(window.chrome && chrome.tabs)) return resolve(false); // no chrome env.

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let tab = tabs[0];
            let hostname = regexTheHostname(new UrlParser(tab.url).hostname);
            isWebsiteBlocked(hostname).then(resolve);
        });
    });
};

export const isWebsiteBlocked = async hostname => {
    const blockedUrls = await getWebsites();
    // sidenote: shouldn't we compare regex? let hostname be OK for now..
    return blockedUrls.find(blocked => blocked.hostname === hostname);
};

export const blockWebsite = async text => {
    let urls = parseUrls(text);
    if (!urls.length) return message.error('No valid link.');

    const blockedUrls = await getWebsites();
    
    let notBlocked = url => {
        return !blockedUrls.find(blocked => blocked.regex === url.regex);
    };
    let blocked = urls.filter(notBlocked);
    blockedUrls.push(...blocked);

    await setFirebaseData({ blockedUrls });
    await setInStorage({ blockedUrls });

    if (blocked.length > 1) {
        message.success(`Blocked ${blocked.length} websites`);
        await setHistoricalFirebase({ blockedUrls});
    }
    else if (blocked.length === 1) {
        message.success(`Blocked ${blocked[0].hostname}`);
        await setHistoricalFirebase({ blockedUrls});
    }
    else {
        message.success(`${urls[0].hostname} is already blocked.`);
    }
}

export const addExerciseSite = async url => {
    if (!url) return;

    const res = await getFromStorage('exerciseSites');
    const exerciseSites = res.exerciseSites || defaultExerciseSites;

    let alreadyIn = exerciseSites.find(site => site.name === url.name);
    if (!alreadyIn) {
        exerciseSites.push(url);
        message.success(`Added exercise site!`); // @TODO make messages like in blockWebsite()
    } else {
        message.error('Duplicate exercise site name');
    }

    await setHistoricalFirebase({ exerciseSites });
  
    await setInStorage({ exerciseSites });
}

export const removeExerciseSite = async name => {
    const res = await getFromStorage('exerciseSites');
    let exerciseSites = res.exerciseSites || defaultExerciseSites;
    exerciseSites = exerciseSites.filter(site => site.name !== name);

    await setHistoricalFirebase({ exerciseSites });
    await setInStorage({ exerciseSites });
}

export const unblockWebsite = (hostname) => {
    getWebsites().then(async oldBlockedUrls => {
        let blockedUrls = oldBlockedUrls.filter(blockedUrl =>
            blockedUrl.hostname !== hostname);

        setHistoricalFirebase({ blockedUrls});
        return setInStorage({ blockedUrls });
    }).then(() => message.success(`Unblocked ${hostname}`));
};

//
export const setTimeout = async (url, timeout) => {
    let res = await getFromStorage('blockedUrls');
    let { blockedUrls } = res; // cant be empty, cause were blocked.
    blockedUrls = blockedUrls.map(blockedUrl => {
        if (blockedUrl.domain === url.domain) {
            // compose a date in the future in milliseconds since epoch,
            // by adding exercise duration milliseconds
            timeout += timeout;
            blockedUrl.timeout = timeout;
        }
        return blockedUrl;
    });

    let doa = url.hostname;
    setHistoricalFirebase({ [doa]: timeout});
    return setInStorage({ blockedUrls });
};

// utility functions
export const parseUrls = text => {
    return autoLink(text)
        .map(urlToParser)
        .map(mapToBlockedUrl)
        .map(parseDomainFromUrl);
}

export const parseUrl = text => parseUrls(text)[0];

const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const parseDomainFromUrl = urlObject => {
    let parsed = parseDomain(urlObject.href);
    return {
        ...urlObject,
        ...parsed, // attaches subdomain, domain, tld
        name: parsed && capitalize(parsed.domain)
    }
}

const autoLink = url => {
    let matches = Autolinker.parse(url, {
        urls: true,
        email: false,
        phone: false
    });
    return matches;
}

const urlToParser = (match) => {
    let url = match.getUrl();
    let parser = new UrlParser(url);
    return parser;
}

const mapToBlockedUrl = (parser) => {
    let regex = `*://*.${parser.hostname}/*`;
    let hostname = regexTheHostname(parser.hostname);
    let { href, pathname } = parser;

    return {
        hostname,
        href,
        pathname,
        regex
    };
}

const regexTheHostname = (hostname) => {
    return hostname.match(/(^(?:https?:\/\/)?)((?:[^@\/\n]+@)?)(?:www\.)?([^:\/?\n]+)/)[3];
}
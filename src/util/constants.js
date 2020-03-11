export const defaultExerciseSites = [
  {
    "hostname": "web.hellotalk.com",
    "href": "https://web.hellotalk.com/",
    "pathname": "/",
    "regex": "*://*.web.hellotalk.com/*",
    "tld": "com",
    "domain": "hellotalk",
    "subdomain": "web",
    "name": "Hellotalk"
  },
  {
    "hostname": "www.zeeguu.org",
    "href": "https://www.zeeguu.org/practice/#!/practice/plan/0",
    "pathname": "//practice/#!/practice/plan/0",
    "regex": "*://*.www.zeeguu.org/*",
    "tld": "org",
    "domain": "zeeguu",
    "subdomain": "www",
    "name": "Zeeguu"
  }
  // 'https://www.brainscape.com/'
];

export const defaultExerciseSite = defaultExerciseSites[1];

export const defaultexerciseDuration = 1 * 10 * 1000; // 10 seconds

export const defaultTimeout = 5 * 60 * 1000; // 5 minutes

export const defaultTimeoutInterval = 5 * 60 * 1000; // 5 minute- increments

export const s2 = 'https://www.google.com/s2/favicons?domain=';
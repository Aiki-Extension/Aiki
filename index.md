---
layout: default
---

# The Distraction Shield

## General Information
 
The Distraction Shield is a browser extension designed to take advantage of our human nature. 
It is a very common scenario to find ourselves browsing sites such as Facebook or Reddit while we are supposed to be working. 
The Distraction Shield can help you to do something useful and enriching; a distraction 'Aikido'. 

The main functionality of The Distraction Shield extension is to detect when the user enters a website that they consider a distraction. 
It then presents a language exercise instead. Once the user has completed the exercise, they will be free to continue onto the original site. 
The user can choose for which sites the redirection should happen, by adding domain names to a blacklist. 

## Building

Build by first running `yarn` and then building the project:

```shell
yarn build
```

Project will be built under `/build`.

## Running in Chrome

Enable developer options in the Chrome `chrome://extensions` page and load the `/build` by hitting the "Load unpacked" button.
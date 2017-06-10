import {showDataCollectionModal} from '../dataCollection/dataCollection'

let id;

let tour = new Tour({
    orphan: true,
    steps: [{
        path: "/introTour/introTour.html",
        title: "Welcome to The Distaction Shield",
        content: "Wanna know how Distraction Shield protects you ? " +
        " Click <b> ‘Next’ </b> " +
        "If you want to use it right away, click <b>‘End tour’</b>",
    }, {
        path: "/introTour/introTour.html",
        element: "#tourID",
        title: "Tooltip",
        content: "This is the tooltip button. Clicking on this button opens the <b> tooltip menu </b>, from where you can control" +
        " The Distraction Shield. We'll have a look at it now. Click <b>'Next'</b> to continue.",
        placement: "bottom"
    }, {
        path: "/introTour/tooltipcopy.html",
        element: "#saveBtn",
        title: "Save Button",
        content: "Clicking this button will add the current website to <b> your personal blacklist </b>. " +
        "Now, when you will enter this website you will be redirected. This helps you add all your  " + "" +
        "sites to a blacklist <b>fast and easy</b>. Click <b>'Next'</b> to continue. ",
        placement: "left"
    }, {
        path: "/introTour/tooltipcopy.html",
        element: "#statisticsBtn",
        title: "Statistics Button",
        content: "Wanna know <b>how much time </b> you save? Click here and find interesting <b>statistics</b>.",
        placement: "left"
    }, {
        path: "/introTour/tooltipcopy.html",
        element: "#optionsBtn",
        title: "Options Button",
        content: "Do you want to <b>customize your experience</b>? <br> By pressing this button you can open the <b>options page</b>.",
        placement: "left"
    }, {
        path: "/introTour/optionscopy.html",
        element: "#modeSelector",
        title: "Modes",
        content: "Here you can select which <b>mode</b> you want The Distraction Shield to use. <br>" +
        "Do you feel <b>Lazy</b>? With this mode you will always have the option of <b>skipping your exercise</b>. <br>" +
        " With <b>Pro</b>, you will <b>make the most of your time</b>, cause every time you enter one of your blocked" +
        " sites, you will <b>have to solve a set of exercises </b>.",
        placement: "left"
    }, {
        path: "/introTour/optionscopy.html",
        element: "#interval-slider",
        title: "Interval Slider",
        content: "Use the slider to chose <b>how often</b> you want to be redirected. <br> " +
        "<i> For example if you chose 10 minutes, " +
        "after being redirected once, you will not be redirected again for another 10 minutes. </i>",
        placement: "right"

    }, {
        path: "/introTour/optionscopy.html",
        element: "#blacklistTable",
        title: "Blacklist",
        content: "Here you can see <b>the list of websites</b> that you will be redirected from.<br> You " +
        "can <b>deselect</b> a site to disable redirection on that site temporarily, or <b>remove</b> it " +
        "completely.",
        placement: "left"
    }, {
        path: "/introTour/optionscopy.html",
        element: "#addUrlDiv",
        title: "Add to Blacklist",
        content: "You can <b>add</b> a site to the blacklist here. Just enter the address and hit <b>save</b>.",
        placement: "left"
    }, {
        path: "/introTour/optionscopy.html",
        element: "#turnOff-slider",
        title: "Turn Off",
        content: "You can use this slider to <b>disable</b> The Distraction Shield temporarily. Select the" +
        " amount of time you want and click <b>’Turn Off’</b>.",
        placement: "bottom"
    }, {
        path: "/introTour/optionscopy.html",
        title: "Thank You!",
        content: "Thanks for choosing The Distraction Shield and Happy Learning!"
    }],
    onEnd: ()=> {
        /**
         * This function inits the data consent message with the parameter isStatic.
         * This makes sure that the user does not accidentally closes the window.
         * After this, the user is redirected to the optionspage
         */
        showDataCollectionModal($('#dataConsentModal'), true, () =>{
            chrome.tabs.query({currentWindow: true, active: true}, tab => {
                chrome.tabs.update(tab.id, {url: chrome.runtime.getURL('optionsPage/options.html')});
            });
        });
    }
});

/** Initialize the tour */
tour.init();

/** Start the tour */
tour.start();

/** Restart tour link */
if (tour.ended()) {
    chrome.tabs.getSelected(null, tab => {
        if (tab.url.indexOf('/introTour/introTour.html') !== -1) {
            tour.restart();
        }
    });
}

/** get current tab */
chrome.tabs.getSelected(null, tab =>{
    id = tab.id;
});

/** end tour if tab closed */
chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === id) {
        tour.end();
    }
});
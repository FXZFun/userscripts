// ==UserScript==
// @name         YouTube Clip Machine
// @namespace    https://fxzfun.com/
// @version      0.2
// @description  Use a url parameter to make your own clips
// @author       FXZFun
// @match        https://www.youtube.com/live/*
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @license      GNU GPL v3
// ==/UserScript==

(function() {
    'use strict';

    const params = new URLSearchParams(location.search);
    let clipStart = params.get('t', null);
    let clipEnd = params.get('et', null);

    const vid = document.querySelector('video');

    if (clipStart) {
        clipStart = clipStart.replace('s', '');
        vid.currentTime = clipStart;
    }

    if (clipEnd) {
        clipEnd = clipEnd.replace('s', '');
        setInterval(() => {
            if (Math.floor(vid.currentTime) == Math.floor(clipEnd)) {
                vid.currentTime = clipStart;
            }
        }, 100);
    }
})();

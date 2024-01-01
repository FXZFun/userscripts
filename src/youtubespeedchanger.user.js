// ==UserScript==
// @name         YouTube Speed Changer
// @namespace    https://fxzfun.com/userscripts
// @version      0.2
// @description  Use a url parameter to change the video speed
// @author       FXZFun
// @match        https://www.youtube.com/live/*
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @license      MIT
// ==/UserScript==
 
(function() {
    'use strict';
 
    var params = new URLSearchParams(location.search);
    var speed = params.get("s", null);
    if (speed) {
        document.querySelector("video").playbackRate = speed;
    }
})();

// ==UserScript==
// @name         Rental Utils
// @namespace    https://fxzfun.com/userscripts
// @version      2023-12-31
// @description  cleans up the unnecessary junk off the end of urls and links location to vrbo
// @author       FXZFun
// @match        https://*.vrbo.com/*
// @match        https://*.airbnb.com/rooms/*
// @icon         https://fxzfun.com/favicon.ico
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    function extractLatLngFromUrl(url) {
        const markersIndex = url.indexOf('markers=');
        if (markersIndex === -1) return null;

        const markersString = url.substring(markersIndex);
        const regex = /markers=.*?%7C([-+]?\d*\.\d+)%2C([-+]?\d*\.\d+)/;
        const match = markersString.match(regex);

        if (match && match.length === 3) {
            const latitude = parseFloat(match[1]);
            const longitude = parseFloat(match[2]);
            return { latitude, longitude };
        }
    }

    async function getAddress(lat, lng) {
        let r = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${lng}%2C${lat}&f=pjson`);
        let j = await r.json();
        return j.address.Match_addr;
    }

    if (location.host.endsWith('vrbo.com')) {
        const woSearch = window.location.href.replace(window.location.search, '');
        window.history.replaceState(null, null, woSearch);

        const mapImage = [...document.querySelectorAll("img")].filter(i => i.src.startsWith("https://maps.googleapis.com"))[0];
        const ll = extractLatLngFromUrl(mapImage.src);
        const addr = await getAddress(ll.latitude, ll.longitude);
        console.log(ll);
        console.log(addr);
        const p = document.createElement("a");
        p.target = "_blank";
        p.href = `https://www.google.com/maps/search/?api=1&query=${ll.latitude},${ll.longitude}`;
        p.style = "position: relative;background: #ffffffd1;z-index: 999999999;";
        p.innerText = addr;
        mapImage.insertAdjacentElement("afterEnd", p);
    }

    if (location.host.endsWith('airbnb.com')) {
        const woSearch = window.location.href.replace(window.location.search, '');
        window.history.replaceState(null, null, woSearch);
        setTimeout(() => window.history.replaceState(null, null, woSearch), 1000);
    }
})();

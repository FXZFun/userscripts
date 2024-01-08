// ==UserScript==
// @name         Rental Utils
// @namespace    https://fxzfun.com/userscripts
// @version      2024-01-07
// @description  cleans up the unnecessary junk off the end of urls and links location to vrbo
// @author       FXZFun
// @match        https://*.vrbo.com/*
// @match        https://*.airbnb.com/rooms/*
// @icon         https://fxzfun.com/favicon.ico
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    async function getAddress(lat, lng) {
        let r = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${lng}%2C${lat}&f=pjson`);
        let j = await r.json();
        return j.address.Match_addr;
    }

    if (location.host.endsWith('vrbo.com')) {
        const woSearch = window.location.href.replace(window.location.search, '');
        window.history.replaceState(null, null, woSearch);

        const ll = new URLSearchParams(__PLUGIN_STATE__.controllers.stores.staticMap.signedUrlNoPins).get("center").split(',');
        const addr = await getAddress(ll[0], ll[1]);
        console.log(ll);
        console.log(addr);
        const p = document.createElement("a");
        p.target = "_blank";
        p.href = `https://www.google.com/maps/search/?api=1&query=${ll}`;
        p.style = "position: relative;background: #ffffffd1;z-index: 999;";
        p.innerText = addr;
        [...document.querySelectorAll("img")].filter(i => i.src.startsWith("https://maps.googleapis.com"))[0].insertAdjacentElement("afterEnd", p);
    }

    if (location.host.endsWith('airbnb.com')) {
        const woSearch = window.location.href.replace(window.location.search, '');
        window.history.replaceState(null, null, woSearch);
        setTimeout(() => window.history.replaceState(null, null, woSearch), 1000);
    }
})();

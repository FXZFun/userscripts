// ==UserScript==
// @name         WME Simple Alert Messages
// @namespace    https://fxzfun.com/userscripts
// @version      3.2.4
// @description  changes the styling of the segment and venue messages
// @author       FXZFun
// @match        https://*.waze.com/*/editor*
// @match        https://*.waze.com/editor*
// @exclude      https://*.waze.com/user/editor*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        none
// @license      MIT
// ==/UserScript==
 
/* global W, OpenLayers, trustedTypes */
 
(function() {
    'use strict';
    const DEBUG = false;
 
    class Messages {
        static LOCKED = "locked";
        static EA = "ea";
        static MIXED = "mixed";
        static PUR = "pur";
        static CLOSURE = "closure";
        static HIDE_MESSAGE = "hide_message";
        static SNAPSHOT_ACTIVE = "snapshot";
        static ROUTING_PREFERENCE = "routing";
        static JUNCTION_BOX = "junction_box";
 
        static messages = {
            "locked":        { "icon": "w-icon-lock-fill", "message": "Locked to L{maxLock}" },
            "ea":            { "icon": "w-icon-alert-fill", "message": "Out of your EA" },
            "mixed":         { "icon": "w-icon-round-trip", "message": "Mixed A/B" },
            "pur":           { "icon": "w-icon-location-update-fill", "message": "PUR Request" },
            "closure":       { "icon": "w-icon-closure", "message": "Has Closures" },
            "snapshot":      { "icon": "w-icon-restore", "message": "Snapshot Mode On" },
            "routing":       { "icon": "w-icon-route", "message": "Routing Pref" },
            "junction_box":  { "icon": "w-icon-polygon", "message": "In Junction Box" }
        }
 
        static getMessage(type, maxLock='') {
            return this.messages?.[type]?.message?.replace('{maxLock}', maxLock);
        }
 
        static getIcon(type) {
            return this.messages?.[type]?.icon;
        }
    }
 
    class MessageContainer {
        container;
 
        constructor() {
            this.container = document.getElementById("wmeSamContainer") || document.createElement("div");
            if (!document.getElementById("wmeSamContainer")) {
                this.container.id = "wmeSamContainer";
                document.querySelector("#edit-panel wz-tabs").insertAdjacentElement("beforeBegin", this.container);
            }
        }
 
        reset() {
            this.container.innerHTML = policy.createHTML("");
        }
 
        addMessage(messageType, maxLock='') {
            this.container.insertAdjacentHTML("beforeEnd", policy.createHTML(`<span class="wmeSamMessage ${messageType}"><i class="w-icon ${Messages.getIcon(messageType)}"></i> ${Messages.getMessage(messageType, maxLock) ?? ''}</span>`));
        }
    }
 
    const policy = trustedTypes.createPolicy('wmeSamPolicy', { createHTML: (input) => input});
 
    function getUrl() {
        let center = W.map.getCenter();
        let lonlat = new OpenLayers.LonLat(center.lon, center.lat);
        lonlat.transform(new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:4326'));
        let zoom = W.map.getZoom();
 
        let features = W.selectionManager.getSelectedFeatures();
        let featureType = features[0].attributes.wazeFeature._wmeObject.getType()
        features = features.map(f => f.attributes.wazeFeature.id);
 
        let url = location.href.split("?")[0] + `?env=${W.map.wazeMap.regionCode}&lat=${lonlat.lat}&lon=${lonlat.lon}&zoomLevel=${zoom}`;
        if (features.length > 0) url += `&${featureType}s=${features.join(",")}`;
        return url;
    }
 
    function getCity() {
        var city = document.querySelector(".location-info").innerText.split(",")[0];
        if (document.querySelector(".wmecitiesoverlay-region") != null) city = document.querySelector(".wmecitiesoverlay-region").innerText;
        return city;
    }
 
    function addLockRequestCopier(maxLock, routingType=false) {
        let chip = document.querySelector(".wmeSamMessage.locked") ?? document.querySelector(".wmeSamMessage.routing");
        chip.addEventListener("click", () => {
            navigator.clipboard.writeText(`:unlock${maxLock}: ${routingType ? ':arrow_down_small:' : ''} ${getCity()} - *reason* - <${getUrl()}>`);
            chip.innerHTML = policy.createHTML(`<span class="wmeSamMessage locked"><i class="w-icon w-icon-copy"></i> Copied!</span>`);
        });
    }
 
    function isOOEA(id) {
        if ((typeof id === "string" && id.includes("OpenLayers")) || W.snapshotManager.isSnapshotOn()) return false; // not OOEA
 
        const type = typeof id === "string" && id.includes(".") ? "venues" : "segments";
        const model = W.model[type].objects[id];
 
        const userRank = W.loginManager.getUserRank();
        const lockRank = model?.getLockRank();
        const propertiesEditable = model.arePropertiesEditable();
 
        if (propertiesEditable) return false; // not OOEA
        if (lockRank > userRank) return type === "venues"; // locked up
        if (userRank >= lockRank) return !propertiesEditable; // unlocked but not editable
        return false;
    }
 
 
    window.isOOEA = isOOEA;
 
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
 
    async function getPanel() {
        for (let i = 0; i < 100; i++) {
            const panel = document.querySelector("#edit-panel");
            const tabs = document.querySelector("#edit-panel wz-tabs");
            if (panel && tabs) return panel;
            await sleep(100);
        }
    }
 
    async function processSelectionChange() {
        let selected = W.selectionManager.getSelectedFeatures();
        let userRank = W.loginManager.user.getRank();
        let maxLockRank = Math.max(...selected.map(item => item.attributes.wazeFeature._wmeObject.attributes.lockRank));
        let maxRoutingType = Math.max(...selected.map(s => s.attributes.wazeFeature._wmeObject.getAttribute("routingRoadType")));
 
        if (selected.length === 0) return;
 
        // wait for panel to open
        let panel = await getPanel();
        if (!panel) {
            console.error("WME SAM: Could not open panel");
            return;
        }
 
        // add or clear message container
        let messageContainer = new MessageContainer();
        messageContainer.reset();
 
        const wzAlerts = Array.from(document.querySelector('wz-alerts-group')?.children || []);
        wzAlerts.forEach(wzAlert => {
            let messageType;
 
            if (userRank < maxLockRank) messageType = Messages.LOCKED;
            if (wzAlert?.innerHTML?.includes('driven area') || (maxLockRank <= userRank && wzAlert?.innerHTML?.includes('editing area'))) messageType = Messages.EA;
            if (wzAlert?.classList?.contains('inconsistent-direction-alert')) messageType = Messages.MIXED;
            if (wzAlert?.innerHTML?.includes('pending')) messageType = Messages.PUR;
            if (wzAlert?.innerHTML?.includes('active road closures')) messageType = Messages.CLOSURE;
            if (wzAlert?.innerHTML?.includes('junction box')) messageType = Messages.JUNCTION_BOX;
            if (wzAlert?.innerHTML?.includes('reviewed')) messageType = Messages.HIDE_MESSAGE;
 
            if (!!messageType) {
                if (messageType !== Messages.HIDE_MESSAGE) messageContainer.addMessage(messageType, maxLockRank + 1);
                if (!DEBUG) wzAlert?.classList?.add("hide");
                if (DEBUG) console.log("WME SAM: " + messageType);
            }
            if (messageType === Messages.LOCKED) addLockRequestCopier(maxLockRank + 1, !!maxRoutingType);
            if (messageType === Messages.PUR) document.querySelector(".wmeSamMessage.pur").addEventListener("click", () => { document.querySelector(".venue-alerts wz-alert span[slot=action]").click(); });
        });
 
        if (W.snapshotManager.isSnapshotOn()) messageContainer.addMessage(Messages.SNAPSHOT_ACTIVE);
        if (!document.querySelector(".wmeSamMessage.ea") && [...selected].some(obj => isOOEA(obj.attributes.wazeFeature.id))) messageContainer.addMessage(Messages.EA);
        if (!!maxRoutingType) {
            messageContainer.addMessage(Messages.ROUTING_PREFERENCE);
            addLockRequestCopier(maxLockRank + 1, !!maxRoutingType);
        }
 
        // hide message box if no unhandled alerts
        const wzAlertsGroup = document.querySelector("wz-alerts-group");
        const visibleAlerts = Array.from(wzAlertsGroup?.children || []).filter(_ => _?.classList.contains('hide') === false);
        if (visibleAlerts.length === 0) {
            wzAlertsGroup.classList.add('hide');
        }
    }
 
    function initialize() {
        console.log("WME SAM: Loaded");
        W.selectionManager.events.register('selectionchanged', this, processSelectionChange);
 
        // run preselected features from url
        if (W.selectionManager.getSelectedFeatures().length > 0) processSelectionChange();
 
        // add styling
        let style = document.createElement("style");
        style.innerHTML = policy.createHTML(`/* WME Simple Alert Messages Styling */
            #wmeSamContainer {padding-top: 10px;}
            .wmeSamMessage {padding: 7px 10px; border-radius: 10px; width: fit-content; margin-left: 5px; white-space: nowrap;}
            .wmeSamMessage .w-icon {font-size: 20px;vertical-align: middle;}
            .wmeSamMessage.locked {background-color: #FE5F5D; cursor: pointer;}
            .wmeSamMessage.ea, .wmeSamMessage.junction_box {background-color: #FF9800;}
            .wmeSamMessage.mixed, .wmeSamMessage.snapshot {background-color: #42A5F5;}
            .wmeSamMessage.pur {background-color: #C9B5FF; cursor: pointer;}
            .wmeSamMessage.closure {background-color: #FE5F5D; cursor: pointer;}
            .wmeSamMessage.routing {background-color: #FF9800; cursor: pointer;}`);
        document.body.appendChild(style);
    }
 
    // bootstrap
    W?.userscripts?.state?.isReady ? initialize() : document.addEventListener("wme-ready", initialize, { once: true });
})();

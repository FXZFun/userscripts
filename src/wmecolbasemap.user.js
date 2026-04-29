// ==UserScript==
// @name         WME COL Basemap
// @namespace    https://fxzfun.com/
// @version      4.0.1
// @description  Adds aerials from the COL GIS as a basemap for WME
// @author       FXZFun
// @include      https://beta.waze.com/*
// @include      https://www.waze.com/editor*
// @include      https://www.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @exclude      https://www.waze.com/editor/sdk/*
// @connect      query.cityoflewisville.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waze.com
// @grant        GM_xmlhttpRequest
// @license      GNU GPLv3
// ==/UserScript==

(async function () {

    const SCRIPT_NAME = GM_info.script.name;
    const SCRIPT_ID = SCRIPT_NAME.replaceAll(' ', '').toLowerCase();

    const State = {
        enabled: false,
        date: null,
        dates: [],
        ticket: null,
        bubbleVisible: true,
        bubblePosition: { top: 40, left: 10 },
        shortcut: null
    };

    const saveState = () => localStorage.setItem(SCRIPT_ID, JSON.stringify({
        bubbleVisible: State.bubbleVisible,
        bubblePosition: State.bubblePosition,
        dates: State.dates,
        shortcut: State.shortcut,
        ticket: State.ticket,
        ticketExpiry: State.ticketExpiry
    }));
    const loadState = () => Object.assign(State, JSON.parse(localStorage.getItem(SCRIPT_ID) || '{}'));

    const API = {
        async fetchJsonAsync(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    onload: r => resolve(JSON.parse(r.response)),
                    onerror: reject
                });
            });
        },

        async refreshAsync() {
            const json = await this.fetchJsonAsync('https://query.cityoflewisville.com/v2/?webservice=NearmapTicketAndDates');
            const data = json[0][0];

            State.ticket = data.ticket;
            State.dates = JSON.parse(data.aerialdates).map(d => d.date.replaceAll('.', ''));
            State.date = State.date || State.dates[0];
            // ticket expires 2 days after being issued
            State.ticketExpiry = new Date().getTime() + (2 * (1000 * 60 * 60 * 24));

            saveState();
        },

        async getTicketAsync() {
            if (!State.ticket) await this.refreshAsync();
            return State.ticket;
        },

        shouldRefresh() {
            // renew ticket 1 day before expiry
            return new Date().getTime() >= parseInt(State.ticketExpiry) - (1 * (1000 * 60 * 60 * 24));
        }
    };

    const Layer = {
        buildOptions(date, ticket) {
            return {
                tileWidth: 256,
                tileHeight: 256,
                url: {
                    servers: ["https://us0.nearmap.com"],
                    fileName: "maps/?x=${x}&y=${y}&z=${z}",
                    params: { nml: "V", version: 2, nmd: date, ticket }
                }
            };
        },

        async initAsync(sdk) {
            const ticket = await API.getTicketAsync();

            sdk.Map.addTileLayer({
                layerName: SCRIPT_ID,
                layerOptions: this.buildOptions(State.date, ticket)
            });

            sdk.Map.setLayerVisibility({ layerName: SCRIPT_ID, visibility: State.enabled });
            sdk.Map.setLayerZIndex({ layerName: SCRIPT_ID, zIndex: sdk.Map.getLayerZIndex({ layerName: 'satellite_pleiades_ortho_rgb' }) + 1 });
        },

        async setDateAsync(sdk, date) {
            State.date = date;

            sdk.Map.removeLayer({ layerName: SCRIPT_ID });

            await this.initAsync(sdk);

            UI.syncAll(sdk);
        },

        async toggleAsync(sdk) {
            if (API.shouldRefresh()) await API.refreshAsync();

            State.enabled = !State.enabled;
            sdk.Map.setLayerVisibility({ layerName: SCRIPT_ID, visibility: State.enabled });
            UI.syncAll(sdk);
        },

        async enableAsync(sdk) {
            State.enabled = false;
            await this.toggleAsync(sdk);
        },

        async disableAsync(sdk) {
            State.enabled = true;
            await this.toggleAsync(sdk);
        },

        disableWhileMoving(sdk) {
            let alreadyMoving = false;

            sdk.Events.on({
                eventName: 'wme-map-move', eventHandler: async () => {
                    if (!alreadyMoving && State.enabled) {
                        await Layer.disableAsync(sdk);
                        alreadyMoving = true;
                    }
                }
            });

            sdk.Events.on({
                eventName: 'wme-map-move-end', eventHandler: async () => {
                    if (alreadyMoving) {
                        await Layer.enableAsync(sdk);
                        alreadyMoving = false;
                    }
                }
            });
        }
    };

    const UI = {
        populateDates(select) {
            select.innerHTML = '';
            State.dates.forEach(d => {
                const o = document.createElement('wz-option');
                o.value = d;
                o.textContent = d;
                select.appendChild(o);
            });
            select.value = State.date;
        },

        syncAll(sdk) {
            // Power icons
            document.querySelectorAll('.col-power').forEach(el => { el.style.color = State.enabled ? '#00bd00' : '#bdbdbd'; });

            // All selects
            document.querySelectorAll('.col-date-select').forEach(el => {
                if (el.value !== State.date) el.value = State.date;
            });

            sdk.LayerSwitcher.setLayerCheckboxChecked({ isChecked: State.enabled, name: SCRIPT_NAME });
        },

        createBubble(sdk) {
            if (!State.bubbleVisible) return;

            const el = document.createElement('div');
            el.id = 'colBubble';

            el.style = `
                position:absolute;
                background:var(--background_default);
                border-radius:12px;
                padding:6px;
                box-shadow:0 3px 10px rgba(0,0,0,0.25);
                display:flex;
                gap:8px;
                align-items:center;
                cursor:move;
            `;

            el.style.top = State.bubblePosition.top + 'px';
            el.style.left = State.bubblePosition.left + 'px';

            const grip = document.createElement('i');
            grip.className = 'fa fa-ellipsis-v';
            grip.style.color = 'gray';
            grip.style.userSelect = 'none';

            const power = document.createElement('i');
            power.className = 'col-power fa fa-power-off';
            power.style.cursor = 'pointer';
            power.style.padding = '12px';
            power.onclick = async (e) => {
                e.stopPropagation();
                await Layer.toggleAsync(sdk);
            };

            const select = document.createElement('wz-select');
            select.classList.add('col-date-select');

            this.populateDates(select);
            select.addEventListener('change', async e => await Layer.setDateAsync(sdk, e.target.value));

            el.append(grip, power, select);

            let dragging = false, x, y;

            el.addEventListener('mousedown', (e) => {
                dragging = true;
                x = e.offsetX;
                y = e.offsetY;
            });

            document.addEventListener('mousemove', (e) => {
                if (!dragging) return;
                const { x: parentX, y: parentY } = el.parentElement.getBoundingClientRect();
                el.style.left = (e.pageX - parentX - x) + 'px';
                el.style.top = (e.pageY - parentY - y) + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (!dragging) return;
                dragging = false;

                State.bubblePosition.top = parseInt(el.style.top);
                State.bubblePosition.left = parseInt(el.style.left);

                saveState();
            });

            document.querySelector('#map').appendChild(el);
        },

        updateBubble(sdk) {
            document.getElementById('colBubble')?.remove();
            this.createBubble(sdk);
            this.syncAll(sdk);
        },

        async initSidebarAsync(sdk) {
            const { tabLabel, tabPane } = await sdk.Sidebar.registerScriptTab();

            const label = document.createElement('span');
            label.classList = 'col-power fa fa-power-off';
            label.style = 'margin-right:5px;cursor:pointer;color:#ccc;';
            label.onclick = async (e) => {
                e.stopPropagation();
                await Layer.toggleAsync(sdk);
            };

            tabLabel.append(label, document.createTextNode(' COL'));

            const root = document.createElement("div");
            root.style.padding = "8px";

            root.innerHTML = `
            <h3>${SCRIPT_NAME}</h3>

            <div style="margin-top:15px;">
                <wz-checkbox id="colBubbleToggle" ${State.bubbleVisible ? "checked" : ""}>
                    Show Settings Bubble
                </wz-checkbox>
            </div>

            <div style="margin-top:15px;">
                <span title="Dates reflect Nearmap imagery captured over Lewisville, TX. Other areas may not be updated in each collection.">
                    Collection Date <i class="fa fa-info-circle"></i>
                </span>
                <wz-select class="col-date-select" style="width:100%"></wz-select>
            </div>

            <div style="margin-top:15px; text-align: center">
                <wz-button id="colReloadToken" color="text" size="sm">
                    Reload API token
                </wz-button>
            </div>

            <p style="margin: 20px auto;"><b>Note:</b> please do not use as your default basemap - only enable when needed, as we do not want to abuse the service provided by the City of Lewisville GIS.</p>
        `;

            tabPane.appendChild(root);

            root.querySelectorAll('.col-date-select').forEach(s => {
                this.populateDates(s);
                s.addEventListener('change', async e => await Layer.setDateAsync(sdk, e.target.value));
            });

            root.querySelector('#colBubbleToggle').onchange = e => {
                State.bubbleVisible = e.target.checked;
                this.updateBubble(sdk);
                saveState();
            };

            root.querySelector('#colReloadToken').onclick = async () => {
                await API.refreshAsync();
                root.querySelectorAll('.col-date-select').forEach(s => this.populateDates(s));
                await Layer.setDateAsync(sdk, State.date);
                this.syncAll(sdk);
            };
        },

        addShortcut(sdk) {
            const savedKeys = State.shortcut;

            if (savedKeys) {
                try {
                    sdk.Shortcuts.deleteShortcut({ shortcutId: SCRIPT_ID });
                } catch (e) { }
            }

            sdk.Shortcuts.createShortcut({
                shortcutId: SCRIPT_ID,
                description: 'Toggle COL Basemap layer',
                shortcutKeys: savedKeys,
                callback: async () => {
                    const convertShortcut = (shortcut) => {
                        const [m, k] = shortcut.split(',').map(Number);

                        const modifiers =
                              (m & 1 ? 'C' : '') +
                              (m & 2 ? 'S' : '') +
                              (m & 4 ? 'A' : '');

                        const key =
                              (k >= 48 && k <= 57) || (k >= 65 && k <= 90)
                        ? String.fromCharCode(k).toLowerCase()
                        : k;

                        return modifiers ? `${modifiers}+${key}` : String(key);
                    };

                    const shortcut = sdk.Shortcuts
                    .getAllShortcuts()
                    .find(s => s.shortcutId === SCRIPT_ID);

                    if (shortcut?.shortcutKeys) {
                        State.shortcut = convertShortcut(shortcut.shortcutKeys);
                        saveState();
                    }

                    await Layer.toggleAsync(sdk);
                }
            });
        },

        addLayerToggle(sdk) {
            sdk.LayerSwitcher.addLayerCheckbox({ name: SCRIPT_NAME });
            sdk.Events.on({ eventName: 'wme-layer-checkbox-toggled', eventHandler: async () => await Layer.toggleAsync(sdk) });
        }
    };

    try {
        const context = 'unsafeWindow' in window ? window.unsafeWindow : window;
        await context.SDK_INITIALIZED;
        const sdk = context.getWmeSdk({ scriptId: SCRIPT_ID, scriptName: SCRIPT_NAME });

        await new Promise(res => sdk.State.isReady() ? res() : sdk.Events.once({ eventName: 'wme-ready' }).then(res));
        console.log(`${SCRIPT_NAME}: Initializing`);

        loadState();

        if (API.shouldRefresh() || !State.dates.length) await API.refreshAsync();
        State.date = State.date || State.dates[0];

        await Layer.initAsync(sdk);
        await UI.initSidebarAsync(sdk);
        UI.createBubble(sdk);
        UI.addShortcut(sdk);
        UI.addLayerToggle(sdk);
        UI.syncAll(sdk);

        Layer.disableWhileMoving(sdk);

        console.log(`${SCRIPT_NAME}: Ready`);
    } catch (e) {
        console.error(`${SCRIPT_NAME}: Error ${e}`);
    }
})();

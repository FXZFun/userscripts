// ==UserScript==
// @name         Crime Map Addons
// @namespace    https://fxzfun.com/userscripts
// @version      1.0.3
// @description  Adds searchbox and churches to crime map, syncs with realtor addon
// @author       FXZFun
// @match        https://crimegrade.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=crimegrade.org
// @grant        none
// @require      https://greasyfork.org/scripts/462303-crime-map-churches-layer-data/code/Crime%20Map%20Churches%20Layer%20Data.js?version=1210010
// @require      https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js
// @license      MIT
// ==/UserScript==

/* global churchesDb, maplibregl, cgMap_1 */

(async function () {
   "use strict";

   async function resolveElement(selector, interval = 500) {
      return new Promise((resolve) => {
         const id = setInterval(() => {
            let el = document.querySelector(selector);
            if (!!el) {
               clearInterval(id);
               resolve(el);
            }
         }, interval);
      });
   }

   async function resolveMap(interval = 500) {
      return new Promise((resolve) => {
         const id = setInterval(() => {
            if (typeof cgMap_1 !== "undefined" && "map" in cgMap_1) {
               clearInterval(id);
               resolve(cgMap_1.map);
            }
         }, interval);
      });
   }

   (await resolveElement(".triggerWrapper")).click();

   const map = await resolveMap();
   window.map = map;

   const params = new URLSearchParams(location.search);

   const center = params.has("lat")
      ? { lat: params.get("lat").replace("/", ""), lng: params.get("lng").replace("/", "") }
      : map.getCenter();

   document
      .querySelectorAll(".bnNavItem a")
      .forEach((el) => (el.href += `?lat=${center.lat}&lng=${center.lng}`));

   window.top?.postMessage({ sender: "crime map addons", message: "loaded" });

   if (params.has('z')) {
       map.setZoom(parseInt(params.get('z').replace("/", "")));
   }

   if (params?.has("lat") && params?.has("lng")) {
      const marker1 = new maplibregl.Marker()
         .setLngLat([
            params?.get("lng")?.replace("/", "") ?? PlaceLng,
            params?.get("lat")?.replace("/", "") ?? PlaceLat,
         ])
         .addTo(map);
       map.setCenter(center);
   }

   if (!params.has("noChurches")) {
      map.addSource("places", { type: "geojson", data: churchesDb });

      map.addLayer({
         id: "places",
         type: "circle",
         source: "places",
         paint: {
            "circle-color": "darkred",
            "circle-radius": 8,
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
         },
      });

      const popup = new maplibregl.Popup({ closeOnClick: false });

      map.on("mouseover", "places", (e) => {
         map.getCanvas().style.cursor = "pointer";
      });

      map.on("click", "places", (e) => {
         const coordinates = e.features[0].geometry.coordinates.slice();
         const name = e.features[0].properties.Name;
         const description = e.features[0].properties.description;
         const properties = e.features[0].properties;

         while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
         }

         var address = `${properties.Address}, ${properties.City}, ${properties.State_Province}`;
         popup
            .setLngLat(coordinates)
            .setHTML(
               `
                     <h4>${properties.Name}</h4>
                     <b>Address:</b> <a href="https://www.google.com/maps/search/?api=1&query=${address}" target="_blank">${address}</a><br>
                     <b>Affiliation:</b> ${properties.Affiliation}<br>
                     <b>Type:</b> ${properties.Type}<br>
                     <b>More Info:</b> <a href="${properties.More_Info}" target="_blank">${properties.More_Info}</a><br>
                    `,
            )
            .addTo(map);
      });
   }

   if (params.has("fullscreen")) {
      document.querySelector("#map-1").classList.add("map--fullscreen");
      document
         .querySelectorAll(".maplibregl-ctrl")
         .forEach((el) => el.remove());
      document.body.style.overflow = "hidden";
   } else {
      // insert autocomplete search bar
      const div = document.createElement("div");
      div.innerHTML = `
         <form class="searchField" onsubmit="return false">
            <input id="searchTextField" type="text" size="50" class="pac-target-input" placeholder="Enter a location" autocomplete="off">
            <button onclick="changePlace()" type="submit" class="btn" style="display: none;">Find</button>
         </form>
         <style>
            #searchTextField {
               width: 25%;
               padding: 10px;
               transition: 0.25s;
            }
            #searchTextField:focus { width: 75%; }
            form input,
            form textarea {
               width: 100%;
               background-color: #fafafa;
               margin: 2vh 1vw;
               padding: 10px 10px 10px 5px;
               border: none;
               border-radius: .2em .2em 0 0;
               font-family: "Open Sans", sans-serif;
               font-size: 1em;
               border-bottom: 1.5px solid #757575;
               box-shadow: 0px 0px 5px #2121218a;
            }

            form input:focus,
            form textarea:focus {
               outline: none;
               border-bottom: 1.5px solid #2196F3;
            }
            .searchField {
               position: absolute;
               top: 10px;
               left: 50px;
               width: 100%;
               display: inline-block;
               z-index: 1;
            }
         </style>`;
      const script = document.createElement("script");
      script.src =
         "https://maps.googleapis.com/maps/api/js?key=AIzaSyDuDBm96B82JKMvrKPy1GHuGCRavIXiuLs&libraries=places&v=weekly&callback=loadAutocomplete";
      div.appendChild(script);
      document
         .querySelector(".maplibregl-ctrl-top-left")
         .insertAdjacentElement("afterEnd", div);
   }

   if (params.has("removeLayers"))
      map.style.stylesheet.layers.forEach(
         (l) =>
            (l.type === "line" || l.type === "symbol") && map.removeLayer(l.id),
      );

   window.loadAutocomplete = () => {
      var input = document.getElementById("searchTextField");
      var options = {
         types: ["(cities)"],
         componentRestrictions: { country: "us" },
      };
      let autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.setFields(["geometry"]);
      google.maps.event.addListener(autocomplete, "place_changed", () => {
         var place = autocomplete.getPlace();
         if (place !== null) {
            history.replaceState(
               {},
               null,
               `?lat=${place.geometry.location.lat()}&lng=${place.geometry.location.lng()}`,
            );
            map.flyTo({
               center: [
                  place.geometry.location.lng(),
                  place.geometry.location.lat(),
               ],
            });
            const marker1 = new maplibregl.Marker()
               .setLngLat([
                  place.geometry.location.lng(),
                  place.geometry.location.lat(),
               ])
               .addTo(map);
            document
               .querySelectorAll(".bnNavItem a")
               .forEach((el) => (el.href += `?lat=${place.geometry.location.lat()}&lng=${place.geometry.location.lng()}`));
         }
      });
   };

   window.addEventListener("message", (event) => {
      if (event.data && event.data.sender == "realtor addons") {
         let pos = event.data.message;
         map?.fitBounds([
            [pos[1], pos[0]],
            [pos[3], pos[2]],
         ], { linear: true, animate: false });
      }
   });
})();

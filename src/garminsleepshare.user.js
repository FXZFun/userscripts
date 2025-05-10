// ==UserScript==
// @name         Garmin Sleep Share
// @namespace    https://fxzfun.com/
// @version      0.9.0
// @description  Share your sleep score as a single photo instead of multiple screenshots of the app
// @author       FXZFun, Dubster
// @match        https://connect.garmin.com/modern/sleep/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=garmin.com
// @grant        none
// ==/UserScript==

(async function () {
   "use strict";

   const getElementAsync = async (selector) => {
      return new Promise((resolve) => {
         const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
               clearInterval(interval);
               resolve(element);
            }
         }, 500);
      });
   };

   const getElementsAsync = async (selector) => {
      return new Promise((resolve) => {
         const interval = setInterval(() => {
            const element = document.querySelectorAll(selector);
            if (element) {
               clearInterval(interval);
               resolve(element);
            }
         }, 500);
      });
   };

   const getSleepDataAsync = async () => {
      return new Promise(async (resolve) => {
         const scoreEl = (await getElementAsync(elementSelectors.score));
         const dataFields = [...await getElementsAsync(elementSelectors.dataFields)];
         const scoreFactors = [...await getElementsAsync(elementSelectors.scoreFactors)];
         resolve({
            score: scoreEl.innerText,
            duration: scoreFactors[0].innerText,
            message: (await getElementAsync(elementSelectors.message)).innerText,
            heartRate: dataFields.filter((f) => f.innerText.endsWith("bpm"))[0].innerText,
            bodyBattery: dataFields.filter((f) => f.innerText.startsWith("+"))[0].innerText,
            breathRate: dataFields.filter((f) => f.innerText.endsWith("brpm"))[0].innerText,
            stress: scoreFactors.filter((f) => f.innerText.endsWith("avg"))[0].innerText,
            deepDuration: scoreFactors[2].innerText,
            lightDuration: scoreFactors[3].innerText,
            awakeDuration: scoreFactors[5].innerText.split("•")[0],
            remDuration: scoreFactors[4].innerText,
            graph: (await getElementAsync(elementSelectors.graph)).outerHTML,
         });
      });
   };

   const elementSelectors = {
      score: ".SleepScoreSummary_dailySleepScoreValue__GK7Te",
      dataFields: ".DataBlock_dataField__t4-ai",
      scoreFactors: ".SleepScoreFactorCard_sleepTypeValues__1jbrw",
      message: ".SleepScoreSummary_shortFeedbackTitle__\\+S5P1",
      graph: ".highcharts-root",
   };

   const scoreEl = await getElementAsync(elementSelectors.score);
   scoreEl.addEventListener("click", async () => {
      window.sleepData = await getSleepDataAsync();

      const container = document.createElement("div");
      document.body.appendChild(container);
      const shadow = container.attachShadow({ mode: "open" });
      window.sleepShadow = shadow;
      const html = `<html lang="en">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Sleep</title>
   <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
   <style>
      * {
          font-family: sans-serif;
          font-size: 125%;
      }
      .sleepScoreContainer {
         background: #212121;
         color: #fafafa;
         font-family: 'Roboto';
         width: 600px;
         height: 600px;
      }

      .sleepScoreContainer {
         background: #212121;
         display: flex;
         flex-wrap: wrap;
         justify-content: space-around;
         align-content: space-around;
         padding: 30px;
      }

      .sleepStatsSection {
         flex-basis: 100%;
         display: flex;
         justify-content: space-between;
      }

      .sleepStatsSection p span:nth-child(1) {
         display: block;
         text-align: center;
         color: #bbb;
      }

      .scoreSection {
         display: flex;
         flex-direction: column;
         flex-basis: 50%;
         align-items: center;
         justify-content: space-evenly;
      }

      span#score {
         font-size: 4em;
         font-weight: bold;
      }

      .sleepStatsSection p span:nth-child(2) {
         font-weight: bold;
      }

      .sleepStatsSection p {
         line-height: 2;
         text-align: center;
      }

      .moreStatsSection span {
          vertical-align: middle;
      }

      svg {
          vertical-align: middle;
          transform: scale(1.5);
          margin: 10px;
      }

      img {
          width: 100%;
      }
   </style>
</head>

<body>
   <div class="sleepScoreContainer">
      <div class="scoreSection">
         <span id="score">0</span>
         <span id="duration">0h 0m</span>
         <span id="message">More blank than ideal, too many errors.</span>
      </div>
      <div class="moreStatsSection">
         <p>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#bbb">
               <path
                  d="M645-840q100 0 167.5 74T880-590q0 18-2 35.5t-7 34.5H621l-68-102q-5-8-14-13t-19-5q-13 0-23.5 8T482-612l-54 162-35-52q-5-8-14-13t-19-5H89q-5-17-7-34.5T80-589q0-103 67-177t167-74q48 0 90.5 19t75.5 53q32-34 74.5-53t90.5-19ZM480-120q-18 0-34.5-6.5T416-146L148-415q-6-6-11-12t-10-13h211l68 102q5 8 14 13t19 5q13 0 24-8t15-20l54-162 34 52q6 8 15 13t19 5h232l-10 12-10 12-269 270q-13 13-29 19.5t-34 6.5Z">
               </path>
            </svg>
            <span id="heartRate">0 bpm</span>
         </p>
         <p>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#bbb">
               <path
                  d="M160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q20 0 40 1.5t40 4.5v274H160Zm320-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM720 0v-200h-80v-240h240l-80 160h80L720 0Z">
               </path>
            </svg>
            <span id="bodyBattery">+ 0%</span>
         </p>
         <p>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#bbb">
               <path
                  d="M200-120q-51 0-85.5-34.5T80-240v-167l105-281q12-33 42-52.5t65-19.5q26 0 49 13t38 35v112L277-498l43 42 120-120v-304h80v304l120 120 42-42-102-102v-112q15-22 38-35t49-13q35 0 64.5 19.5T774-688l105 281v167q0 51-35 85.5T759-120H639q-50 0-84.5-34.5T520-240v-80l15-127-55-56-56 56 16 127v80q0 51-35 85.5T320-120H200Z">
               </path>
            </svg>
            <span id="breathRate">0 brpm</span>
         </p>
         <p>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#bbb">
               <path
                  d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80ZM298-456l143-104-143-104-36 48 77 56-77 56 36 48Zm122 178 60-60 60 60 60-60 39 39 42-42-81-81-60 60-60-60-60 60-60-60-81 81 42 42 39-39 60 60Zm242-178 36-48-77-56 77-56-36-48-143 104 143 104Z">
               </path>
            </svg>
            <span id="stress">0 avg</span>
         </p>
      </div>

      <div class="sleepStatsSection">
         <p>
            <span>DEEP</span>
            <span id="deepDuration">0h 0m</span>
         </p>
         <p>
            <span>LIGHT</span>
            <span id="lightDuration">0h 0m</span>
         </p>
         <p>
            <span>REM</span>
            <span id="remDuration">0h 0m</span>
         </p>
         <p>
            <span>AWAKE</span>
            <span id="awakeDuration">0h 00m</span>
         </p>
      </div>

      <div id="graph"></div>
   </div>
</body>

</html>`;
      shadow.innerHTML = html;

      const domToImageScript = document.createElement("script");
      domToImageScript.src = "https://unpkg.com/dom-to-image@2.6.0/dist/dom-to-image.min.js";
      domToImageScript.addEventListener("load", () => {
         const imageGeneratorScript = document.createElement("script");
         imageGeneratorScript.type = "module";
         imageGeneratorScript.innerHTML = `
      sleepShadow.getElementById("score").innerText = sleepData.score;
      sleepShadow.getElementById("duration").innerText = sleepData.duration;
      sleepShadow.getElementById("message").innerText = sleepData.message;
      sleepShadow.getElementById("heartRate").innerText = sleepData.heartRate;
      sleepShadow.getElementById("bodyBattery").innerText = sleepData.bodyBattery;
      sleepShadow.getElementById("breathRate").innerText = sleepData.breathRate;
      sleepShadow.getElementById("stress").innerText = sleepData.stress;
      sleepShadow.getElementById("deepDuration").innerText = sleepData.deepDuration;
      sleepShadow.getElementById("lightDuration").innerText = sleepData.lightDuration;
      sleepShadow.getElementById("remDuration").innerText = sleepData.remDuration;
      sleepShadow.getElementById("awakeDuration").innerText = sleepData.awakeDuration;

      let graph = sleepShadow.getElementById("graph");

      let image = document.createElement("img");
      image.src = \`data:image/svg+xml;base64,\${btoa(sleepData.graph)}\`;
      image.addEventListener("load", async () => {
            let canvas = document.createElement("canvas");
            graph.appendChild(canvas);
            canvas.width = 741 - 162;
            canvas.height = 25;

            let context = canvas.getContext("2d");
            context.drawImage(image, -81, -195);

            let strip = canvas.toDataURL("image/png");
            graph.innerHTML = \`<img src="\${strip}" />\`;

            let blob = await domtoimage.toBlob(sleepShadow.querySelector(".sleepScoreContainer"));
            await navigator.clipboard.write([
              new ClipboardItem({ [blob.type]: blob })
            ]);
      });`;

         shadow.appendChild(imageGeneratorScript);
      });
      shadow.appendChild(domToImageScript);
   });
})();

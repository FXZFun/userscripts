// ==UserScript==
// @name         Garmin Sleep Share
// @namespace    https://fxzfun.com/
// @version      0.9.1-beta-000
// @description  Share your sleep score as a single photo instead of multiple screenshots of the app
// @author       FXZFun, Dubster
// @match        https://connect.garmin.com/modern/sleep/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=garmin.com
// @grant        none
// ==/UserScript==

(async function () {
    "use strict";

    function generateImage(args) {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#212121";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Overall Score
        ctx.fillStyle = "#f2f2f2";
        ctx.font = "84px sans-serif";
        ctx.fillText(args.score, 170, 180);

        // Duration
        ctx.fillStyle = "#efefef";
        ctx.font = "24px sans-serif";
        ctx.fillText(args.duration, 170, 220);

        // Message
        ctx.fillText(args.message, 100, 300);

        // Heart Rate
        const hrImg = new Image(24, 24);
        hrImg.src = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23bbb%22%3E%3Cpath%20d%3D%22M300-840q52%200%2099%2022t81%2062q34-40%2081-62t99-22q94%200%20157%2063t63%20157q0%205-.5%2010t-.5%2010h-80q1-5%201-10v-10q0-60-40-100t-100-40q-47%200-87%2026.5T518-666h-76q-15-41-55-67.5T300-760q-60%200-100%2040t-40%20100v10q0%205%201%2010H81q0-5-.5-10t-.5-10q0-94%2063-157t157-63Zm-88%20480h112q32%2031%2070%2067t86%2079q48-43%2086-79t70-67h113q-38%2042-90%2091T538-158l-58%2052-58-52q-69-62-120.5-111T212-360Zm230%2040q13%200%2022.5-7.5T478-347l54-163%2035%2052q5%208%2014%2013t19%205h320v-80H623l-69-102q-6-9-15.5-13.5T518-640q-13%200-22.5%207.5T482-613l-54%20162-34-51q-5-8-14-13t-19-5H40v80h297l69%20102q6%209%2015.5%2013.5T442-320Zm38-167Z%22%2F%3E%3C%2Fsvg%3E';
        hrImg.onload = () => ctx.drawImage(hrImg, 450, 180);
        ctx.fillText(args.heartRate, 480, 180);

        // Body Battery
        const bbImg = new Image(24, 24);
        bbImg.src = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23bbb%22%3E%3Cpath%20d%3D%22M160-160v-112q0-34%2017.5-62.5T224-378q62-31%20126-46.5T480-440q20%200%2040%201.5t40%204.5v81q-20-4-40-5.5t-40-1.5q-56%200-111%2013.5T260-306q-9%205-14.5%2014t-5.5%2020v32h320v80H160Zm80-80h320-320Zm240-240q-66%200-113-47t-47-113q0-66%2047-113t113-47q66%200%20113%2047t47%20113q0%2066-47%20113t-113%2047Zm0-80q33%200%2056.5-23.5T560-640q0-33-23.5-56.5T480-720q-33%200-56.5%2023.5T400-640q0%2033%2023.5%2056.5T480-560Zm0-80ZM720%200v-200h-80v-240h240l-80%20160h80L720%200Z%22%2F%3E%3C%2Fsvg%3E';
        bbImg.onload = () => ctx.drawImage(bbImg, 450, 210);
        ctx.fillText(args.bodyBattery, 480, 210);

        // Respiration
        const brImg = new Image(24, 24);
        brImg.src = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23bbb%22%3E%3Cpath%20d%3D%22M200-120q-51%200-85.5-34.5T80-240v-167l105-281q12-33%2042-52.5t65-19.5q45%200%2076.5%2032.5T400-649v49h-80v-49q0-13-9-22t-21-9q-10%200-18.5%205.5T260-660L160-392v152q0%2017%2011.5%2028.5T200-200h120q17%200%2028.5-11.5T360-240v-80h80v80q0%2051-35%2085.5T320-120H200Zm559%200H639q-50%200-85-34.5T519-240v-80h80v80q0%2017%2011.5%2028.5T639-200h120q17%200%2028.5-11.5T799-240v-152L699-660q-4-9-12-14.5t-18-5.5q-13%200-21.5%209t-8.5%2022v49h-80v-49q0-46%2031.5-78.5T667-760q35%200%2064.5%2019.5T774-688l105%20281v167q0%2051-35%2085.5T759-120ZM320-456Zm319%200Zm-159-47L376-400l-56-56%20120-120v-304h80v304l120%20120-57%2056-103-103Z%22%2F%3E%3C%2Fsvg%3E';
        brImg.onload = () => ctx.drawImage(brImg, 450, 240);
        ctx.fillText(args.breathRate, 480, 240);

        // Stress
        const stImg = new Image(24, 24);
        stImg.src = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23bbb%22%3E%3Cpath%20d%3D%22m298-456%20143-104-143-104-36%2048%2077%2056-77%2056%2036%2048Zm364%200%2036-48-77-56%2077-56-36-48-143%20104%20143%20104ZM420-278l60-60%2060%2060%2060-60%2039%2039%2042-42-81-81-60%2060-60-60-60%2060-60-60-81%2081%2042%2042%2039-39%2060%2060Zm60%20198q-83%200-156-31.5T197-197q-54-54-85.5-127T80-480q0-83%2031.5-156T197-763q54-54%20127-85.5T480-880q83%200%20156%2031.5T763-763q54%2054%2085.5%20127T880-480q0%2083-31.5%20156T763-197q-54%2054-127%2085.5T480-80Zm0-400Zm0%20320q134%200%20227-93t93-227q0-134-93-227t-227-93q-134%200-227%2093t-93%20227q0%20134%2093%20227t227%2093Z%22%2F%3E%3C%2Fsvg%3E';
        stImg.onload = () => ctx.drawImage(stImg, 450, 270);
        ctx.fillText(args.stress, 480, 270);

        // Duration Labels
        ctx.font = "24px sans-serif";
        ctx.fillText("DEEP", 100, 450);
        ctx.fillText("LIGHT", 200, 450);
        ctx.fillText("REM", 300, 450);
        ctx.fillText("AWAKE", 400, 450);

        // Durations
        ctx.fillStyle = "#f2f2f2";
        ctx.fillText(args.deepDuration, 100, 550);
        ctx.fillText(args.lightDuration, 200, 550);
        ctx.fillText(args.remDuration, 300, 550);
        ctx.fillText(args.awakeDuration, 400, 550);

        // Sleep Graph
        const sgImg = new Image();
        sgImg.src = `data:image/svg+xml;base64,${btoa(args.graph)}`;
        sgImg.onload = () => {
            let sgCanvas = document.createElement("canvas");
            sgCanvas.width = 741 - 162;
            sgCanvas.height = 25;

            let sgContext = sgCanvas.getContext("2d");
            sgContext.drawImage(sgImg, -81, -195);

            let strip = sgCanvas.toDataURL("image/png");
            const graph = new Image();
            graph.src = strip;
            graph.onload = () => ctx.drawImage(graph, 45, 600);
        };
    }

    window.gi = generateImage;

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
            const sleepMetrics = [...await getElementsAsync(elementSelectors.sleepMetrics)];
            const scoreFactors = [...await getElementsAsync(elementSelectors.scoreFactors)];
            resolve({
                score: (await getElementAsync(elementSelectors.score)).innerText,
                duration: scoreFactors[0].innerText,
                message: (await getElementAsync(elementSelectors.message)).innerText,
                heartRate: sleepMetrics[1].innerText,
                bodyBattery: sleepMetrics[2].innerText,
                breathRate: sleepMetrics[5].innerText,
                stress: scoreFactors[1].innerText,
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
        scoreTitle: "h4",
        sleepMetrics: ".SleepStats_sleepStatsContainer__qHHZ3 .DataBlock_dataField__t4-ai",
        scoreFactors: ".SleepScoreFactorCard_sleepTypeValues__1jbrw",
        message: ".SleepScoreSummary_shortFeedbackTitle__\\+S5P1",
        graph: ".highcharts-root",
    };

    const scoreEl = await getElementAsync(elementSelectors.scoreTitle);

    const shareBtn = document.createElement("button");
    shareBtn.id = "myShareBtn";
    shareBtn.style = `background: #efefef;padding: 5px 10px;border-radius: 10px;float: right;`;
    shareBtn.innerText = "Share";
    scoreEl.insertAdjacentElement("beforeBegin", shareBtn);

    shareBtn.addEventListener("click", async () => {
        shareBtn.innerText = "...";
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
            const sb = document.getElementById("myShareBtn");
            sb.innerText = "Copied";
            sb.style.background = "#4CAF50";
      });`;

            shadow.appendChild(imageGeneratorScript);
        });
        shadow.appendChild(domToImageScript);
    });
})();

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

      // Just to make sure all images load
      let heartIconLoaded = false;
      let bodyBatteryIconLoaded = false;
      let respirationIconLoaded = false;
      let stressIconLoaded = false;
      let graphLoaded = false;

      // Date
      const dateString = location.href.split("/sleep/")[1]
      const [year, month, day] = dateString.split("-")
      // const date = new Date(year, month, day);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      const monthName = months[parseInt(month) - 1];
      const prettyDateString = `${monthName.toUpperCase()} ${parseInt(day)}, ${year}`;

      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "#787878";
      ctx.fillText(prettyDateString, canvas.width - 10, 10);


      const mainSleepStatsArea = (canvas.width / 3) * 2;

      // Overall Score
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#f2f2f2";
      ctx.font = "bold 100px sans-serif";
      ctx.fillText(args.score, mainSleepStatsArea / 2, 180);

      // Duration
      ctx.fillStyle = "#efefef";
      ctx.font = "30px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(args.duration, mainSleepStatsArea / 2, 220);

      // Message
      const messageX = mainSleepStatsArea / 2;
      let messageY = 300;
      const splitMessage = splitText(args.message);
      splitMessage.forEach(line => {
         ctx.fillText(line, messageX, messageY);
         messageY += 40;
      });

      // Heart Rate
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const sleepStatsIconX = mainSleepStatsArea;
      const iconSize = 40;
      const hrImg = new Image(24, 24);
      hrImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='40px' viewBox='0 -960 960 960' width='40px' fill='%23bbbbbb'%3E%3Cpath d='M292.77-856.39q54.73 0 102.37 23.45 47.64 23.45 84.29 68.33 40.66-46.88 87.11-69.33 46.46-22.45 99.56-22.45 98.23 0 164.26 66.05 66.03 66.06 66.03 164.34 0 9.83-.88 19.89-.89 10.06-3.55 19.89h-89.48q2.72-9.83 4.24-19.89 1.53-10.06 1.53-19.89 0-61.74-40.02-101.99-40.02-40.26-101.86-40.26-48.05 0-89.78 30.03-41.72 30.02-64.72 81.31H446.9q-22.07-51-64.21-81.17-42.14-30.17-89.77-30.17-61.29 0-100.95 40.07-39.65 40.06-39.65 102.18 0 9.83 1.33 19.89 1.34 10.06 4.44 19.89H68.04q-2.66-9.97-3.55-19.98-.88-10.02-.88-19.8 0-98.28 65.89-164.34 65.9-66.05 163.27-66.05ZM181.71-373.78h119.48q33.74 35.5 77.72 77.49 43.99 41.99 100.52 93.99 56.92-52.38 100.57-94.18 43.65-41.8 77.39-77.3h119.92q-41.35 47.64-100.14 105.04-58.78 57.39-139.95 131.94l-57.79 51.61-57.4-51.61q-81.56-74.48-140.23-132.02-58.67-57.54-100.09-104.96Zm265.19 34.49q12.22 0 22.4-7.3 10.19-7.29 14.47-19.37l46.8-139.2 39.31 50.8q6.89 6.66 14.98 10.29 8.09 3.62 17.59 3.62h317.1v-79.1H619.57l-69.12-84.51q-7.22-8.04-16.3-12.39-9.08-4.35-19.96-4.35-12.18 0-22.6 7.11-10.43 7.11-14.33 19.18l-46.13 138.68-38.14-49.81q-6.51-6.66-14.27-10.29-7.76-3.62-17.26-3.62H40.45v79.1h301.01l67.42 84.04q6.66 8.42 16.59 12.77 9.94 4.35 21.43 4.35Zm33.67-146.17Z'/%3E%3C/svg%3E";
      hrImg.onload = () => {
         ctx.drawImage(hrImg, sleepStatsIconX, 100, iconSize, iconSize);
         heartIconLoaded = true;
      }
      ctx.fillText(args.heartRate, sleepStatsIconX + iconSize + 10, 100 + (iconSize / 2));

      // Body Battery
      const bbImg = new Image(24, 24);
      bbImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='40px' viewBox='0 -960 960 960' width='40px' fill='%23bbbbbb'%3E%3Cpath d='M144.17-136.07v-116.88q0-40.87 20.92-72.18 20.93-31.31 54.61-47.65 66.65-30.9 130.85-46.44 64.19-15.55 129.45-15.55 23.54 0 47.08 2.41 23.54 2.4 46.7 6.68v87.97q-23.63-4.58-46.79-6.56-23.16-1.98-46.99-1.98-55.91 0-109.35 11.94-53.43 11.93-110.22 38.99-12.44 6.14-20.28 18.48-7.83 12.33-7.83 26.26v26.36h341.46v88.15H144.17Zm88.15-88.15h341.46-341.46Zm247.6-264.55q-73.04 0-121.06-48.02-48.02-48.01-48.02-121.06 0-73.05 48.02-121.05t121.06-48q73.05 0 121.33 48 48.29 48 48.29 121.05t-48.29 121.06q-48.28 48.02-121.33 48.02Zm0-88.14q34.63 0 57.86-23.17 23.23-23.17 23.23-57.83 0-34.81-23.14-57.83-23.15-23.01-57.79-23.01-34.63 0-57.86 23.06-23.23 23.07-23.23 57.59 0 34.75 23.14 57.97 23.15 23.22 57.79 23.22Zm.08-81.02ZM720.45-2.16v-198.29h-80v-239.1h238.87l-80 160h79.9L720.45-2.16Z'/%3E%3C/svg%3E";
      bbImg.onload = () => {
         ctx.drawImage(bbImg, sleepStatsIconX, 160, iconSize, iconSize);
         bodyBatteryIconLoaded = true;
      }
      ctx.fillText(args.bodyBattery, sleepStatsIconX + iconSize + 10, 160 + (iconSize / 2));

      // Respiration
      const brImg = new Image(24, 24);
      brImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='40px' viewBox='0 -960 960 960' width='40px' fill='%23bbbbbb'%3E%3Cpath d='M163.75-109.26q-48.63 0-82.49-33.75-33.86-33.74-33.86-82.22v-188.99l108.13-281.55q13.46-34.93 44.69-54.95 31.23-20.02 68.49-20.02 47.9 0 80.89 33.84 32.99 33.85 32.99 81.23v44.22h-88.52v-44.22q0-11.29-8.3-19.11-8.3-7.81-19.54-7.81-9.37 0-17.25 4.21-7.89 4.21-10.95 12.81l-102.1 266.22v174.12q0 11.82 8 19.82t19.82 8h160.28q11.82 0 19.82-8t8-19.82v-70.7H440v70.7q0 48.48-33.82 82.22-33.83 33.75-82.15 33.75H163.75Zm632.73 0H636.2q-48.32 0-82.14-33.75-33.83-33.74-33.83-82.22v-70.7h88.15v70.7q0 11.82 8 19.82t19.82 8h160.28q12.11 0 19.97-8 7.86-8 7.86-19.82v-174.12L722.2-665.57q-3.31-8.52-11.26-12.77-7.95-4.25-17.22-4.25-11.25 0-19.41 7.81-8.15 7.82-8.15 19.11v44.22h-88.52v-44.22q0-47.38 33.06-81.23 33.06-33.84 80.28-33.84 37.31 0 68.78 20.05t44.94 54.92l108.13 281.55v189.14q0 48.27-34.05 82.04-34.04 33.78-82.3 33.78ZM313.7-451.48Zm332.84 0ZM480-493.41 376-389.17l-62.3-62.31L435.93-573.5v-317.24h88.14v317.41L646.3-451.48l-62.07 62.31L480-493.41Z'/%3E%3C/svg%3E";
      brImg.onload = () => {
         ctx.drawImage(brImg, sleepStatsIconX, 220, iconSize, iconSize);
         respirationIconLoaded = true;
      }
      ctx.fillText(args.breathRate, sleepStatsIconX + iconSize + 10, 220 + (iconSize / 2));

      // Stress
      const stImg = new Image(24, 24);
      stImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='40px' viewBox='0 -960 960 960' width='40px' fill='%23bbbbbb'%3E%3Cpath d='M296.68-449.59 449.1-560 296.68-670.78l-41.09 56.1L330.9-560l-75.31 54.68 41.09 55.73Zm366.64 0 41.46-55.73L629.1-560l75.68-54.68-41.46-56.1L510.9-560l152.42 110.41ZM420-271.03l60-60 60 60 60-60 39 38.44L687.78-341 600-428.97l-60 60-60-60-60 60-60-60L272.59-341 321-292.59l39-38.44 60 60Zm60.05 206.86q-86.25 0-162.08-32.54-75.83-32.54-132.27-88.99-56.45-56.44-88.99-132.22-32.54-75.77-32.54-162.03 0-86.25 32.54-162.08 32.54-75.83 88.93-132.29 56.39-56.47 132.19-89.18 75.8-32.7 162.09-32.7 86.28 0 162.15 32.67 75.87 32.68 132.32 89.1 56.44 56.42 89.13 132.26Q896.2-566.33 896.2-480q0 86.31-32.7 162.13-32.71 75.82-89.18 132.22-56.46 56.4-132.24 88.94-75.77 32.54-162.03 32.54ZM480-480Zm0 327.68q136.95 0 232.31-95.37 95.37-95.36 95.37-232.31t-95.37-232.31Q616.95-807.68 480-807.68t-232.31 95.37Q152.32-616.95 152.32-480t95.37 232.31q95.36 95.37 232.31 95.37Z'/%3E%3C/svg%3E";
      stImg.onload = () => {
         ctx.drawImage(stImg, sleepStatsIconX, 280, iconSize, iconSize);
         stressIconLoaded = true;
      }
      ctx.fillText(args.stress, sleepStatsIconX + iconSize + 10, 280 + (iconSize / 2));

      // Durations
      // [label, value]
      const durations = [
         ["DEEP", args.deepDuration],
         ["LIGHT", args.lightDuration],
         ["REM", args.remDuration],
         ["AWAKE", args.awakeDuration]
      ];
      const durationLabelY = 450;
      const durationValueY = 500;
      const durationWidth = (canvas.width - 90) / durations.length;

      durations.forEach((durationPair, index) => {
         const [label, duration] = durationPair;
         const x = 45 + (durationWidth * index) + (durationWidth / 2);

         ctx.textAlign = "center";
         ctx.fillStyle = "#bbb";
         ctx.font = "24px sans-serif";
         ctx.fillText(label, x, durationLabelY);
         ctx.font = "30px sans-serif";
         ctx.fillStyle = "#f2f2f2";
         ctx.fillText(duration, x, durationValueY);
      });

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
         graph.onload = () => {
            ctx.drawImage(graph, 45, 575);
            graphLoaded = true;
         }
      };

      return new Promise(resolve => {
         const waitInterval = setInterval(() => {
            if (heartIconLoaded && bodyBatteryIconLoaded && respirationIconLoaded && stressIconLoaded && graphLoaded) {
               clearInterval(waitInterval);
               canvas.toBlob(resolve, "image/png")
            }
         }, 10);
      });
   }

   function splitText(string, length = 25) {
      const result = [""];
      const splitString = string.split(" ");
      splitString.forEach(split => {
         const currentIndex = result.length - 1;
         result[currentIndex] = result[currentIndex].trim();
         let currentString = result[currentIndex];
         if ((currentString + " " + split).length <= length) {
            result[currentIndex] += " " + split;
         } else {
            result.push(split);
         }
      })
      return result;
   }

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

      const canvas = document.createElement("canvas");
      canvas.id = "canvas";
      canvas.width = 660;
      canvas.height = 660;
      document.querySelector(".Gc5Element_main__fyCv9 > h4").parentElement.appendChild(canvas);
      const blob = await generateImage(window.sleepData);
      await navigator.clipboard.write([
         new ClipboardItem({ [blob.type]: blob })
      ]);
      shareBtn.innerText = "Copied";
      shareBtn.style.background = "#4CAF50";
   });
})();

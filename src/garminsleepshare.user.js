// ==UserScript==
// @name         Garmin Sleep Share
// @namespace    https://fxzfun.com/
// @version      0.9.5
// @description  Share your sleep score as a single photo instead of multiple screenshots of the app
// @author       FXZFun, Dubster
// @match        https://connect.garmin.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=garmin.com
// @grant        none
// ==/UserScript==

(async function () {
   "use strict";

   async function generateImage(canvas, sleepData) {
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#212121";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      ctx.fillText(sleepData.score, mainSleepStatsArea / 2, 180);

      // Duration
      ctx.fillStyle = "#efefef";
      ctx.font = "30px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(sleepData.duration, mainSleepStatsArea / 2, 220);

      // Message
      const messageX = mainSleepStatsArea / 2;
      let messageY = 300;
      const splitMessage = splitText(sleepData.message);
      splitMessage.forEach(line => {
         ctx.fillText(line, messageX, messageY);
         messageY += 40;
      });

      // Sleep Metrics
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const sleepStatsIconX = mainSleepStatsArea;
      const iconSize = 40;

      // Heart Rate
      const heartImage = new Image();
      heartImage.src = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23bbb%22%20viewBox%3D%220%20-960%20960%20960%22%3E%3Cpath%20d%3D%22M480-484Zm0%20373q-20%200-39-7t-31-22L142-409q-36-35-54-81-17-47-17-99%200-108%2070-184t173-76q47%200%2090%2017%2042%2018%2076%2051%2033-33%2076-51%2042-17%2089-17%20103%200%20174%2076%2070%2076%2070%20183%200%2052-18%2099-18%2046-52%2081L550-140q-14%2015-32%2022t-38%207Zm40-521q10%200%2019%205t14%2013l63%2097h175q8-17%2011-35%204-19%204-38%200-72-47-124-46-52-114-52-32%200-62%2013-29%2014-51%2038l-27%2029q-5%205-11%208-7%203-14%203t-14-3-12-8l-27-29q-22-24-52-37-29-14-61-14-68%200-114%2052t-46%20124q0%2019%204%2038%203%2018%2010%2035h192q10%200%2019%205t14%2013l35%2054%2054-159q5-12%2015-20t23-8Zm12%20123-55%20159q-4%2012-15%2020t-23%208q-10%200-18-5-9-5-14-14l-64-97H230l232%20230%206%204q3%202%207%202t7-2%206-4l241-230H600q-10%200-18-5-9-5-15-13l-35-53Z%22%2F%3E%3C%2Fsvg%3E";
      await heartImage.decode();
      ctx.drawImage(heartImage, sleepStatsIconX, 100, iconSize, iconSize);
      ctx.fillText(sleepData.heartRate, sleepStatsIconX + iconSize + 10, 100 + (iconSize / 2));

      // Body Battery
      const batteryImage = new Image();
      batteryImage.src = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23bbb%22%20viewBox%3D%220%20-960%20960%20960%22%3E%3Cpath%20d%3D%22M144-136v-117q0-41%2021-72t55-48q66-31%20131-46%2064-16%20129-16%2024%200%2047%203%2024%202%2047%206v88l-47-6q-23-2-47-2-56%200-109%2012-54%2012-111%2039-12%206-20%2018t-8%2026v27h342v88H144Zm88-88h342-342Zm248-265q-73%200-121-48t-48-121q0-73%2048-121t121-48q73%200%20121%2048%2049%2048%2049%20121t-49%20121q-48%2048-121%2048Zm0-88q35%200%2058-23t23-58q0-35-23-58t-58-23q-35%200-58%2023t-23%2058q0%2035%2023%2058t58%2023Zm0-81ZM720-2v-198h-80v-240h239l-80%20160h80L720-2Z%22%2F%3E%3C%2Fsvg%3E";
      await batteryImage.decode();
      ctx.drawImage(batteryImage, sleepStatsIconX, 160, iconSize, iconSize);
      ctx.fillText(sleepData.bodyBattery, sleepStatsIconX + iconSize + 10, 160 + (iconSize / 2));

      // Respiration
      const breathImage = new Image();
      breathImage.src = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23bbb%22%20viewBox%3D%220%20-960%20960%20960%22%3E%3Cpath%20d%3D%22M164-109q-49%200-83-34t-34-82v-189l109-282q13-35%2044-55t69-20q48%200%2081%2034t33%2081v45h-89v-45q0-11-8-19-9-8-20-8-9%200-17%205-8%204-11%2012L136-399v174q0%2012%208%2020t20%208h160q12%200%2020-8t8-20v-71h88v71q0%2048-34%2082t-82%2034H164Zm632%200H636q-48%200-82-34t-34-82v-71h88v71q0%2012%208%2020t20%208h160q13%200%2020-8%208-8%208-20v-174L722-666q-3-8-11-12-8-5-17-5-12%200-20%208t-8%2019v45h-88v-45q0-47%2033-81t80-34q37%200%2069%2020t45%2055l108%20282v189q0%2048-34%2082t-83%2034ZM314-451Zm333%200Zm-167-42L376-389l-62-62%20122-122v-318h88v318l122%20122-62%2062-104-104Z%22%2F%3E%3C%2Fsvg%3E";
      await breathImage.decode();
      ctx.drawImage(breathImage, sleepStatsIconX, 220, iconSize, iconSize);
      ctx.fillText(sleepData.breathRate, sleepStatsIconX + iconSize + 10, 220 + (iconSize / 2));

      // Stress
      const stressImage = new Image();
      stressImage.src = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23bbb%22%20viewBox%3D%220%20-960%20960%20960%22%3E%3Cpath%20d%3D%22m297-450%20152-110-152-111-41%2056%2075%2055-75%2055%2041%2055Zm366%200%2042-55-76-55%2076-55-42-56-152%20111%20152%20110ZM420-271l60-60%2060%2060%2060-60%2039%2038%2049-48-88-88-60%2060-60-60-60%2060-60-60-87%2088%2048%2048%2039-38%2060%2060Zm60%20207q-86%200-162-33-76-32-132-89-57-56-89-132-33-76-33-162t33-162q32-76%2089-132%2056-57%20132-89%2076-33%20162-33t162%2032q76%2033%20132%2090%2057%2056%2090%20132%2032%2076%2032%20162t-32%20162q-33%2076-90%20132-56%2057-132%2089-76%2033-162%2033Zm0-416Zm0%20328q137%200%20232-96%2096-95%2096-232t-96-232q-95-96-232-96t-232%2096q-96%2095-96%20232t96%20232q95%2096%20232%2096Z%22%2F%3E%3C%2Fsvg%3E";
      await stressImage.decode();
      ctx.drawImage(stressImage, sleepStatsIconX, 280, iconSize, iconSize);
      ctx.fillText(sleepData.stress, sleepStatsIconX + iconSize + 10, 280 + (iconSize / 2));

      // Durations
      // [label, value]
      const durations = [
         ["DEEP", sleepData.deepDuration],
         ["LIGHT", sleepData.lightDuration],
         ["REM", sleepData.remDuration],
         ["AWAKE", sleepData.awakeDuration]
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
         ctx.fillStyle = "#f2f2f2";
         ctx.font = "30px sans-serif";
         ctx.fillText(duration, x, durationValueY);
      });

      // Sleep Graph
      const graphBlob = new Blob([sleepData.graph], { type: "image/svg+xml" });
      const graphUrl = URL.createObjectURL(graphBlob);
      
      const graphImage = new Image();
      graphImage.src = graphUrl;
      await graphImage.decode();
      
      ctx.drawImage(graphImage, 81, 195, graphImage.naturalWidth - 162, 25, 45, 575, 579, 25);

      return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
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

   const getElementsAsync = async (selector) => {
      return new Promise((resolve) => {
         function _resolveElements() {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
               clearInterval(interval);
               resolve(elements);
            }
         }
         const interval = setInterval(_resolveElements, 500);
         _resolveElements();
      });
   };

   const getSleepDataAsync = async () => {
      return new Promise(async (resolve) => {
         const sleepMetrics = [...await getElementsAsync(elementSelectors.sleepMetrics)];
         const scoreFactors = [...await getElementsAsync(elementSelectors.scoreFactors)];
         resolve({
            score: (await getElementsAsync(elementSelectors.score))[0].innerText,
            duration: scoreFactors[0].innerText,
            message: (await getElementsAsync(elementSelectors.message))[0].innerText,
            heartRate: sleepMetrics[1].innerText,
            bodyBattery: sleepMetrics[2].innerText,
            breathRate: sleepMetrics[5].innerText,
            stress: scoreFactors[1].innerText,
            deepDuration: scoreFactors[2].innerText,
            lightDuration: scoreFactors[3].innerText,
            awakeDuration: scoreFactors[5].innerText.split("•")[0],
            remDuration: scoreFactors[4].innerText,
            graph: (await getElementsAsync(elementSelectors.graph))[0].outerHTML,
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

   const setupShare = async () => {
      if (!!document.getElementById("sleepShareBtn")) return;

      const scoreEl = (await getElementsAsync(elementSelectors.scoreTitle)).filter(h4 => h4.innerText = "Sleep Score")[0];

      const shareBtn = document.createElement("button");
      shareBtn.id = "sleepShareBtn";
      shareBtn.style = `background: #efefef;padding: 5px 10px;border-radius: 10px;float: right;`;
      shareBtn.innerText = "Share";
      scoreEl.insertAdjacentElement("beforeBegin", shareBtn);

      shareBtn.addEventListener("click", async () => {
         shareBtn.innerText = "...";
         const sleepData = await getSleepDataAsync();

         const canvas = document.createElement("canvas");
         canvas.id = "canvas";
         canvas.width = 660;
         canvas.height = 660;

         const blob = await generateImage(canvas, sleepData);
         await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
         ]);
         shareBtn.innerText = "Copied";
         shareBtn.style.background = "#4CAF50";
      });
   };

   let currentURL = "";
   setInterval(() => {
      if (location.href !== currentURL) {
         if (location.href.includes("/sleep/")) setupShare();
         currentURL = location.href;
      }
   }, 500);
})();

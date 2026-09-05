(() => {
  "use strict";

  /* ---------- Navigation ---------- */
  const screens = document.querySelectorAll(".screen");
  const tabBtns = document.querySelectorAll(".tab-btn");

  function goto(name) {
    screens.forEach(s => s.classList.toggle("active", s.dataset.screen === name));
    tabBtns.forEach(b => b.classList.toggle("active", b.dataset.nav === name));
  }

  tabBtns.forEach(btn => btn.addEventListener("click", () => goto(btn.dataset.nav)));

  document.querySelectorAll("[data-goto]").forEach(el => {
    el.addEventListener("click", () => {
      goto(el.dataset.goto);
      if (el.dataset.tool) selectToolPanel(el.dataset.tool);
    });
  });

  /* ---------- Clock ---------- */
  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  function tickClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    clockEl.textContent = `${h12}:${m} ${suffix}`;
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric"
    });
    greetingEl.textContent =
      h < 5 ? "Good night" :
      h < 12 ? "Good morning" :
      h < 17 ? "Good afternoon" :
      h < 21 ? "Good evening" : "Good night";
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Weather ---------- */
  const cityInput = document.getElementById("city-input");
  const citySearchBtn = document.getElementById("city-search-btn");
  const locateBtn = document.getElementById("locate-btn");
  const suggestionsEl = document.getElementById("city-suggestions");
  const weatherContent = document.getElementById("weather-content");
  const quickWeatherIcon = document.getElementById("quick-weather-icon");
  const quickWeatherText = document.getElementById("quick-weather-text");

  const WEATHER_CODES = {
    0: ["Clear sky", "☀️"], 1: ["Mostly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"], 48: ["Fog", "🌫️"],
    51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
    56: ["Freezing drizzle", "🌧️"], 57: ["Freezing drizzle", "🌧️"],
    61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"],
    66: ["Freezing rain", "🌧️"], 67: ["Freezing rain", "🌧️"],
    71: ["Light snow", "🌨️"], 73: ["Snow", "❄️"], 75: ["Heavy snow", "❄️"], 77: ["Snow grains", "❄️"],
    80: ["Light showers", "🌦️"], 81: ["Showers", "🌧️"], 82: ["Heavy showers", "⛈️"],
    85: ["Snow showers", "🌨️"], 86: ["Snow showers", "🌨️"],
    95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm", "⛈️"], 99: ["Thunderstorm", "⛈️"]
  };
  function weatherInfo(code) { return WEATHER_CODES[code] || ["Unknown", "🌡️"]; }

  let suggestTimer = null;
  cityInput.addEventListener("input", () => {
    clearTimeout(suggestTimer);
    const q = cityInput.value.trim();
    if (q.length < 2) { suggestionsEl.classList.add("hidden"); return; }
    suggestTimer = setTimeout(() => searchCities(q), 350);
  });

  citySearchBtn.addEventListener("click", () => {
    const q = cityInput.value.trim();
    if (q) searchCities(q);
  });

  async function searchCities(q) {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
      const data = await res.json();
      renderSuggestions(data.results || []);
    } catch (e) {
      suggestionsEl.classList.add("hidden");
    }
  }

  function renderSuggestions(results) {
    if (!results.length) { suggestionsEl.classList.add("hidden"); return; }
    suggestionsEl.innerHTML = "";
    results.forEach(r => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      const region = [r.admin1, r.country].filter(Boolean).join(", ");
      div.textContent = region ? `${r.name} — ${region}` : r.name;
      div.addEventListener("click", () => {
        suggestionsEl.classList.add("hidden");
        cityInput.value = r.name;
        loadWeather(r.latitude, r.longitude, r.name);
      });
      suggestionsEl.appendChild(div);
    });
    suggestionsEl.classList.remove("hidden");
  }

  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      weatherContent.innerHTML = `<p class="hint">Location isn't available on this device/browser.</p>`;
      return;
    }
    weatherContent.innerHTML = `<p class="hint">Locating…</p>`;
    navigator.geolocation.getCurrentPosition(
      pos => loadWeather(pos.coords.latitude, pos.coords.longitude, "Your location"),
      () => { weatherContent.innerHTML = `<p class="hint">Couldn't get your location. Try searching a city instead.</p>`; },
      { timeout: 10000 }
    );
  });

  async function loadWeather(lat, lon, place) {
    weatherContent.innerHTML = `<p class="hint">Loading weather…</p>`;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=6`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      renderWeather(data, place);
      localStorage.setItem("daily.lastWeather", JSON.stringify({ lat, lon, place }));
    } catch (e) {
      weatherContent.innerHTML = `<p class="hint">Couldn't load weather right now. Check your connection and try again.</p>`;
    }
  }

  function renderWeather(data, place) {
    const cur = data.current;
    const [desc, icon] = weatherInfo(cur.weather_code);
    quickWeatherIcon.textContent = icon;
    quickWeatherText.textContent = `${Math.round(cur.temperature_2m)}°`;

    const days = data.daily.time.map((t, i) => {
      const [d, ic] = weatherInfo(data.daily.weather_code[i]);
      const dayName = i === 0 ? "Today" : new Date(t).toLocaleDateString(undefined, { weekday: "short" });
      return `<div class="forecast-day">
        <div class="fd-name">${dayName}</div>
        <div class="fd-icon">${ic}</div>
        <div class="fd-temp">${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</div>
      </div>`;
    }).join("");

    weatherContent.innerHTML = `
      <div class="weather-card">
        <p class="place">${place}</p>
        <div class="big-icon">${icon}</div>
        <p class="temp">${Math.round(cur.temperature_2m)}°F</p>
        <p class="desc">${desc}</p>
        <div class="weather-meta">
          <div><strong>${Math.round(cur.apparent_temperature)}°</strong>Feels like</div>
          <div><strong>${cur.relative_humidity_2m}%</strong>Humidity</div>
          <div><strong>${Math.round(cur.wind_speed_10m)} mph</strong>Wind</div>
        </div>
      </div>
      <div class="forecast-list">${days}</div>
    `;
  }

  // Restore last location on load
  (function restoreWeather() {
    try {
      const saved = JSON.parse(localStorage.getItem("daily.lastWeather"));
      if (saved) loadWeather(saved.lat, saved.lon, saved.place);
    } catch (e) { /* ignore */ }
  })();

  /* ---------- Tools tab switching ---------- */
  const toolTabs = document.querySelectorAll(".tool-tab");
  const toolPanels = document.querySelectorAll(".tool-panel");

  function selectToolPanel(name) {
    toolTabs.forEach(t => t.classList.toggle("active", t.dataset.toolPanel === name));
    toolPanels.forEach(p => p.classList.toggle("active", p.dataset.panel === name));
  }
  toolTabs.forEach(t => t.addEventListener("click", () => selectToolPanel(t.dataset.toolPanel)));

  /* ---------- Flashlight ---------- */
  const flashBtn = document.getElementById("flashlight-toggle");
  const flashIcon = document.getElementById("flash-icon");
  const flashLabel = document.getElementById("flash-label");
  const flashHint = document.getElementById("flash-hint");
  let torchTrack = null;
  let torchOn = false;
  let screenFlashActive = false;

  async function toggleFlashlight() {
    if (!torchOn) {
      const started = await tryStartTorch();
      if (!started) startScreenFlash();
      torchOn = true;
      flashBtn.classList.add("on");
      flashIcon.textContent = "💡";
      flashLabel.textContent = "Tap to turn off";
    } else {
      stopTorch();
      stopScreenFlash();
      torchOn = false;
      flashBtn.classList.remove("on");
      flashIcon.textContent = "🔦";
      flashLabel.textContent = "Tap to turn on";
    }
  }

  async function tryStartTorch() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      if (!caps.torch) { track.stop(); return false; }
      await track.applyConstraints({ advanced: [{ torch: true }] });
      torchTrack = track;
      flashHint.textContent = "Torch is on.";
      return true;
    } catch (e) {
      return false;
    }
  }

  function stopTorch() {
    if (torchTrack) {
      try { torchTrack.applyConstraints({ advanced: [{ torch: false }] }); } catch (e) { /* ignore */ }
      torchTrack.stop();
      torchTrack = null;
      flashHint.textContent = "Uses your camera's torch when available, otherwise lights up the screen.";
    }
  }

  function startScreenFlash() {
    screenFlashActive = true;
    document.body.style.background = "#ffffff";
    flashHint.textContent = "Screen light on (no camera torch found on this device).";
  }
  function stopScreenFlash() {
    if (screenFlashActive) {
      document.body.style.background = "";
      screenFlashActive = false;
      flashHint.textContent = "Uses your camera's torch when available, otherwise lights up the screen.";
    }
  }

  flashBtn.addEventListener("click", toggleFlashlight);

  /* ---------- Calculator ---------- */
  const calcDisplay = document.getElementById("calc-display");
  let calcCurrent = "0";
  let calcPrev = null;
  let calcOp = null;
  let calcResetNext = false;

  function calcRender() { calcDisplay.textContent = calcCurrent; }

  function calcCompute(a, b, op) {
    a = parseFloat(a); b = parseFloat(b);
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function calcFormat(n) {
    if (Number.isNaN(n)) return "Error";
    if (!isFinite(n)) return "Error";
    const rounded = Math.round(n * 1e10) / 1e10;
    return String(rounded);
  }

  document.querySelectorAll("[data-calc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.calc;
      if (v === "clear") {
        calcCurrent = "0"; calcPrev = null; calcOp = null; calcResetNext = false;
      } else if (v === "sign") {
        calcCurrent = String(parseFloat(calcCurrent) * -1);
      } else if (v === "percent") {
        calcCurrent = String(parseFloat(calcCurrent) / 100);
      } else if (["+", "-", "*", "/"].includes(v)) {
        if (calcOp && !calcResetNext) {
          calcCurrent = calcFormat(calcCompute(calcPrev, calcCurrent, calcOp));
        }
        calcPrev = calcCurrent;
        calcOp = v;
        calcResetNext = true;
      } else if (v === "=") {
        if (calcOp) {
          calcCurrent = calcFormat(calcCompute(calcPrev, calcCurrent, calcOp));
          calcOp = null; calcPrev = null; calcResetNext = true;
        }
      } else if (v === ".") {
        if (calcResetNext) { calcCurrent = "0"; calcResetNext = false; }
        if (!calcCurrent.includes(".")) calcCurrent += ".";
      } else {
        if (calcResetNext || calcCurrent === "0") { calcCurrent = v; calcResetNext = false; }
        else calcCurrent += v;
      }
      calcRender();
    });
  });

  /* ---------- Timer: sub-tabs ---------- */
  const timerTabs = document.querySelectorAll(".timer-tab");
  const timerPanels = document.querySelectorAll(".timer-mode-panel");
  timerTabs.forEach(t => t.addEventListener("click", () => {
    timerTabs.forEach(x => x.classList.toggle("active", x === t));
    timerPanels.forEach(p => p.classList.toggle("active", p.dataset.timerPanel === t.dataset.timerMode));
  }));

  /* ---------- Stopwatch ---------- */
  const swDisplay = document.getElementById("stopwatch-display");
  const swStart = document.getElementById("stopwatch-start");
  const swLap = document.getElementById("stopwatch-lap");
  const swReset = document.getElementById("stopwatch-reset");
  const lapList = document.getElementById("lap-list");
  let swRunning = false, swStartTime = 0, swElapsed = 0, swInterval = null, lapCount = 0;

  function fmtStopwatch(ms) {
    const cs = Math.floor((ms % 1000) / 10);
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  }

  swStart.addEventListener("click", () => {
    if (!swRunning) {
      swRunning = true;
      swStartTime = Date.now() - swElapsed;
      swInterval = setInterval(() => {
        swElapsed = Date.now() - swStartTime;
        swDisplay.textContent = fmtStopwatch(swElapsed);
      }, 30);
      swStart.textContent = "Pause";
      swLap.disabled = false;
    } else {
      swRunning = false;
      clearInterval(swInterval);
      swStart.textContent = "Resume";
      swLap.disabled = true;
    }
  });

  swLap.addEventListener("click", () => {
    lapCount++;
    const li = document.createElement("li");
    li.innerHTML = `<span>Lap ${lapCount}</span><span>${fmtStopwatch(swElapsed)}</span>`;
    lapList.prepend(li);
  });

  swReset.addEventListener("click", () => {
    swRunning = false;
    clearInterval(swInterval);
    swElapsed = 0;
    swDisplay.textContent = "00:00.00";
    swStart.textContent = "Start";
    swLap.disabled = true;
    lapList.innerHTML = "";
    lapCount = 0;
  });

  /* ---------- Countdown ---------- */
  const cdMin = document.getElementById("cd-min");
  const cdSec = document.getElementById("cd-sec");
  const cdDisplay = document.getElementById("countdown-display");
  const cdStart = document.getElementById("countdown-start");
  const cdReset = document.getElementById("countdown-reset");
  let cdInterval = null, cdRemaining = 0, cdRunning = false;

  function fmtCountdown(sec) {
    sec = Math.max(0, sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function syncCountdownFromInputs() {
    cdRemaining = (parseInt(cdMin.value, 10) || 0) * 60 + (parseInt(cdSec.value, 10) || 0);
    cdDisplay.textContent = fmtCountdown(cdRemaining);
  }
  cdMin.addEventListener("input", () => { if (!cdRunning) syncCountdownFromInputs(); });
  cdSec.addEventListener("input", () => { if (!cdRunning) syncCountdownFromInputs(); });
  syncCountdownFromInputs();

  cdStart.addEventListener("click", () => {
    if (!cdRunning) {
      if (cdRemaining <= 0) syncCountdownFromInputs();
      if (cdRemaining <= 0) return;
      cdRunning = true;
      cdStart.textContent = "Pause";
      cdInterval = setInterval(() => {
        cdRemaining--;
        cdDisplay.textContent = fmtCountdown(cdRemaining);
        if (cdRemaining <= 0) {
          clearInterval(cdInterval);
          cdRunning = false;
          cdStart.textContent = "Start";
          cdDisplay.textContent = "Time's up!";
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
        }
      }, 1000);
    } else {
      cdRunning = false;
      clearInterval(cdInterval);
      cdStart.textContent = "Start";
    }
  });

  cdReset.addEventListener("click", () => {
    cdRunning = false;
    clearInterval(cdInterval);
    cdStart.textContent = "Start";
    syncCountdownFromInputs();
  });

  /* ---------- Unit converter ---------- */
  const convCategory = document.getElementById("conv-category");
  const convFrom = document.getElementById("conv-from");
  const convTo = document.getElementById("conv-to");
  const convInput = document.getElementById("conv-input");
  const convOutput = document.getElementById("conv-output");
  const convSwap = document.getElementById("conv-swap");
  const convHint = document.getElementById("conv-hint");

  const UNITS = {
    length: {
      units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
      labels: { m: "Meters", km: "Kilometers", cm: "Centimeters", mm: "Millimeters", mi: "Miles", yd: "Yards", ft: "Feet", in: "Inches" }
    },
    weight: {
      units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125, st: 6.35029318 },
      labels: { kg: "Kilograms", g: "Grams", mg: "Milligrams", lb: "Pounds", oz: "Ounces", st: "Stone" }
    },
    temperature: {
      units: { c: "c", f: "f", k: "k" },
      labels: { c: "Celsius", f: "Fahrenheit", k: "Kelvin" }
    },
    currency: {
      // Approximate fixed rates relative to USD; offline-friendly, clearly labeled as approximate.
      units: { usd: 1, eur: 0.92, gbp: 0.78, jpy: 149, cad: 1.36, aud: 1.51, inr: 83.4 },
      labels: { usd: "US Dollar", eur: "Euro", gbp: "British Pound", jpy: "Japanese Yen", cad: "Canadian Dollar", aud: "Australian Dollar", inr: "Indian Rupee" }
    }
  };

  function populateUnitSelects(category) {
    const def = UNITS[category];
    [convFrom, convTo].forEach(sel => sel.innerHTML = "");
    Object.keys(def.units).forEach((key, i) => {
      [convFrom, convTo].forEach((sel, selIdx) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${key.toUpperCase()} — ${def.labels[key]}`;
        if ((selIdx === 0 && i === 0) || (selIdx === 1 && i === 1)) opt.selected = true;
        sel.appendChild(opt);
      });
    });
    convHint.textContent = category === "currency"
      ? "Approximate rates for quick reference — not live market data."
      : "";
  }

  function convertTemperature(value, from, to) {
    let celsius;
    if (from === "c") celsius = value;
    else if (from === "f") celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15;

    if (to === "c") return celsius;
    if (to === "f") return celsius * 9 / 5 + 32;
    return celsius + 273.15;
  }

  function runConversion() {
    const category = convCategory.value;
    const from = convFrom.value;
    const to = convTo.value;
    const value = parseFloat(convInput.value);
    if (Number.isNaN(value)) { convOutput.value = ""; return; }

    let result;
    if (category === "temperature") {
      result = convertTemperature(value, from, to);
    } else {
      const def = UNITS[category].units;
      const inBase = value * def[from];
      result = inBase / def[to];
    }
    convOutput.value = Math.round(result * 10000) / 10000;
  }

  convCategory.addEventListener("change", () => { populateUnitSelects(convCategory.value); runConversion(); });
  [convFrom, convTo, convInput].forEach(el => el.addEventListener("input", runConversion));
  convSwap.addEventListener("click", () => {
    const tmp = convFrom.value;
    convFrom.value = convTo.value;
    convTo.value = tmp;
    runConversion();
  });

  populateUnitSelects("length");
  runConversion();

  /* ---------- Notes ---------- */
  const noteForm = document.getElementById("note-form");
  const noteInput = document.getElementById("note-input");
  const noteList = document.getElementById("note-list");
  const notesEmptyHint = document.getElementById("notes-empty-hint");

  function loadNotes() {
    try { return JSON.parse(localStorage.getItem("daily.notes")) || []; }
    catch (e) { return []; }
  }
  function saveNotes(notes) {
    localStorage.setItem("daily.notes", JSON.stringify(notes));
  }

  function renderNotes() {
    const notes = loadNotes();
    notesEmptyHint.style.display = notes.length ? "none" : "block";
    noteList.innerHTML = "";
    notes.slice().reverse().forEach(note => {
      const li = document.createElement("li");
      const when = new Date(note.ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
      li.innerHTML = `
        <div>
          <div class="note-text"></div>
          <span class="note-time">${when}</span>
        </div>
        <button class="note-delete" aria-label="Delete">✕</button>
      `;
      li.querySelector(".note-text").textContent = note.text;
      li.querySelector(".note-delete").addEventListener("click", () => {
        const remaining = loadNotes().filter(n => n.id !== note.id);
        saveNotes(remaining);
        renderNotes();
      });
      noteList.appendChild(li);
    });
  }

  noteForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = noteInput.value.trim();
    if (!text) return;
    const notes = loadNotes();
    notes.push({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), text, ts: Date.now() });
    saveNotes(notes);
    noteInput.value = "";
    renderNotes();
  });

  renderNotes();

  /* ---------- Service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* offline support is best-effort */ });
    });
  }
})();

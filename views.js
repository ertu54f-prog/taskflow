/* =========================================================
   Taskflow — Odak modu (Pomodoro), Takvim ve Verimlilik paneli
   ========================================================= */
(() => {
  "use strict";
  const TF = window.Taskflow;
  if (!TF) return;
  const { ICONS, toast, esc, uid, isoDay, ymd } = TF;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const capture = document.documentElement.classList.contains("capture");
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* yok say */ } },
  };
  const DAY = 864e5;
  const ACT_KEY = "taskflow.activity.v1", FOCUS_KEY = "taskflow.focus.v1", TIMER_KEY = "taskflow.timer.v1";
  const CATS = ["İş", "Geliştirme", "Tasarım", "İçerik", "Kişisel"];
  const PRIO_VAR = { high: "var(--high)", medium: "var(--medium)", low: "var(--low)" };
  const PRIO_RANK = { high: 0, medium: 1, low: 2 };
  const startOfDay = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d; };
  const dateOf = (s) => new Date(s + "T12:00:00");
  const fmtMin = TF.fmtMin;
  const currentView = () => (TF.notes ? TF.notes.S.view : "tasks");

  /* =========================================================
     Geçmiş verisi (tamamlama kayıtları + odak seansları)
     ========================================================= */
  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  function seedHistory() {
    const r = rng(7), act = [], focus = [];
    const today = startOfDay(Date.now());
    for (let i = 182; i >= 1; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      const trend = 0.7 + (182 - i) / 420; // zamanla hafifçe artan verim
      let n = weekend ? Math.floor(r() * 2.2) : Math.round((2 + r() * 2.6) * trend);
      if (i > 13 && r() < 0.08) n = 0;
      if (i <= 13 && n === 0) n = 1;     // son günlerde kesintisiz seri
      for (let k = 0; k < n; k++) {
        act.push({ id: `${uid()}a${i}${k}`, t: d.getTime() + (9 + r() * 9) * 36e5, taskId: null, category: CATS[Math.floor(r() * CATS.length)] });
      }
      if (i <= 35) {
        const s = Math.floor(r() * (weekend ? 2 : 4.5));
        for (let k = 0; k < s; k++) {
          focus.push({ id: `${uid()}f${i}${k}`, start: d.getTime() + (9 + k * 1.6) * 36e5, minutes: r() < 0.25 ? 50 : 25, taskId: null, category: CATS[Math.floor(r() * CATS.length)] });
        }
      }
    }
    TF.state.tasks.filter((t) => t.done && t.completedAt).forEach((t) => act.push({ id: uid(), t: t.completedAt, taskId: t.id, category: t.category }));
    const first = TF.state.tasks.find((t) => !t.done);
    if (first) {
      [3.2, 2.6].forEach((h) => focus.push({ id: uid(), start: Date.now() - h * 36e5, minutes: 25, taskId: first.id, category: first.category }));
    }
    return { act, focus };
  }
  let activity = params.has("reset") ? null : store.get(ACT_KEY);
  let sessions = params.has("reset") ? null : store.get(FOCUS_KEY);
  if (!Array.isArray(activity) || !Array.isArray(sessions)) {
    const s = seedHistory();
    activity = s.act; sessions = s.focus;
  }
  const saveHistory = () => { store.set(ACT_KEY, activity); store.set(FOCUS_KEY, sessions); };
  saveHistory();

  TF.focusMinutes = (taskId) => sessions.reduce((sum, s) => sum + (s.taskId === taskId ? s.minutes : 0), 0);

  document.addEventListener("taskflow:complete", (e) => {
    const { task, done } = e.detail;
    if (done) activity.push({ id: uid(), t: Date.now(), taskId: task.id, category: task.category });
    else {
      const idx = activity.map((a) => a.taskId).lastIndexOf(task.id);
      if (idx > -1) activity.splice(idx, 1);
    }
    saveHistory();
  });

  /* =========================================================
     ODAK MODU (Pomodoro)
     ========================================================= */
  const PRESETS = { "25-5": [25, 5, 15], "50-10": [50, 10, 30], "15-3": [15, 3, 9] };
  const MODE_LABEL = { focus: "Odak zamanı", short: "Kısa mola", long: "Uzun mola" };
  const saved = store.get(TIMER_KEY) || {};
  const FS = {
    preset: PRESETS[saved.preset] ? saved.preset : "25-5",
    mode: ["focus", "short", "long"].includes(saved.mode) ? saved.mode : "focus",
    running: !!saved.running, endAt: saved.endAt || 0, remaining: saved.remaining || 0,
    cycle: saved.cycle || 0, taskId: saved.taskId || null, sound: saved.sound !== false,
    periodStart: saved.periodStart || null,
  };
  const dur = (m = FS.mode) => PRESETS[FS.preset][{ focus: 0, short: 1, long: 2 }[m]] * 6e4;
  if (!FS.remaining || FS.remaining > dur()) FS.remaining = dur();
  const persistTimer = () => store.set(TIMER_KEY, FS);
  const ov = $("#focus"), pill = $("#focusPill"), ringC = 2 * Math.PI * 136;
  let tickTimer = null, audioCtx = null, titleBefore = null;

  const fmtClock = (ms) => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  const pending = () => TF.state.tasks.filter((t) => !t.done).sort((a, b) => PRIO_RANK[a.priority] - PRIO_RANK[b.priority]);
  const taskById = (id) => TF.state.tasks.find((t) => t.id === id);
  const elapsedMs = () => dur() - (FS.running ? Math.max(0, FS.endAt - Date.now()) : FS.remaining);

  function chime() {
    if (!FS.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;
      [659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, t0 + i * 0.18);
        g.gain.linearRampToValueAtTime(0.22, t0 + i * 0.18 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.18 + 0.9);
        o.connect(g).connect(audioCtx.destination);
        o.start(t0 + i * 0.18); o.stop(t0 + i * 0.18 + 1);
      });
    } catch (_) { /* ses desteklenmiyor */ }
  }
  function notify(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const opts = { body, icon: "icons/icon.svg", badge: "icons/icon.svg", tag: "taskflow-focus" };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts)).catch(() => {});
    } else { try { new Notification(title, opts); } catch (_) { /* yok say */ } }
  }

  function logFocus(ms) {
    const minutes = Math.round(ms / 6e4);
    if (FS.mode !== "focus" || minutes < 1) return;
    const t = taskById(FS.taskId);
    sessions.push({ id: uid(), start: FS.periodStart || Date.now() - ms, minutes, taskId: t ? t.id : null, category: t ? t.category : "Genel" });
    saveHistory();
    if (currentView() === "tasks") TF.render();
  }

  function setMode(m) {
    FS.mode = m; FS.running = false; FS.remaining = dur(m); FS.periodStart = null;
    persistTimer(); paintFocus();
  }
  function start() {
    if (FS.running) return;
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { /* yok say */ }
    FS.endAt = Date.now() + FS.remaining; FS.running = true;
    FS.periodStart = FS.periodStart || Date.now();
    persistTimer(); loop(); paintFocus();
  }
  function pause() {
    if (!FS.running) return;
    FS.remaining = Math.max(0, FS.endAt - Date.now()); FS.running = false;
    persistTimer(); paintFocus();
  }
  function complete({ skipped = false } = {}) {
    const wasFocus = FS.mode === "focus";
    logFocus(skipped ? elapsedMs() : dur());
    let next = "focus";
    if (wasFocus) { FS.cycle += 1; next = FS.cycle % 4 === 0 ? "long" : "short"; }
    if (!skipped) {
      chime();
      if (wasFocus) { notify("Odak seansı tamamlandı 🎉", "Harika iş! Şimdi kısa bir mola ver."); toast("Odak seansı tamamlandı — mola zamanı", { icon: "coffee" }); }
      else { notify("Mola bitti", "Yeniden odaklanmaya hazır mısın?"); toast("Mola bitti — yeniden odaklan", { icon: "timer" }); }
    }
    setMode(next);
  }
  function resetTimer() {
    logFocus(elapsedMs());
    setMode(FS.mode);
  }
  function loop() {
    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (!FS.running) { clearInterval(tickTimer); return; }
      FS.remaining = Math.max(0, FS.endAt - Date.now());
      if (FS.remaining <= 0) { FS.running = false; complete(); return; }
      paintClock();
    }, 250);
  }

  function setTask(id) {
    if (id === FS.taskId) return;
    if (FS.mode === "focus" && FS.periodStart) {
      // Görev değişirse o ana kadarki süre önceki göreve yazılır
      const ms = elapsedMs();
      if (ms >= 6e4) { logFocus(ms); FS.periodStart = Date.now(); if (!FS.running) FS.remaining = dur(); }
    }
    FS.taskId = id || null;
    persistTimer(); paintFocus();
  }

  function paintClock() {
    const total = dur(), rem = FS.running ? Math.max(0, FS.endAt - Date.now()) : FS.remaining;
    const txt = fmtClock(rem);
    $("#fTime").textContent = txt;
    $("#pillTime").textContent = txt;
    $("#frFill").style.strokeDashoffset = String(ringC * (1 - rem / total));
    if (FS.running) document.title = `${txt} · ${FS.mode === "focus" ? "Odak" : "Mola"} — Taskflow`;
  }
  function paintFocus() {
    ov.dataset.mode = FS.mode;
    pill.dataset.mode = FS.mode;
    $("#fLabel").textContent = MODE_LABEL[FS.mode];
    $$("#focusModes [data-fmode]").forEach((b) => b.classList.toggle("active", b.dataset.fmode === FS.mode));
    $$("#fPresets [data-preset]").forEach((b) => b.classList.toggle("active", b.dataset.preset === FS.preset));
    const tg = $("#fToggle");
    tg.innerHTML = FS.running ? ICONS.pause : ICONS.play;
    tg.setAttribute("aria-label", FS.running ? "Duraklat" : "Başlat");
    tg.classList.toggle("running", FS.running);
    $("#fSound").innerHTML = FS.sound ? ICONS.volume : ICONS.mute;
    $("#fSound").setAttribute("aria-label", FS.sound ? "Sesi kapat" : "Sesi aç");
    const inSet = FS.cycle % 4;
    $("#fDots").innerHTML = [0, 1, 2, 3].map((i) => `<i class="${i < inSet ? "on" : ""}"></i>`).join("");
    const list = pending();
    if (FS.taskId && !list.some((t) => t.id === FS.taskId)) FS.taskId = null;
    $("#fTask").innerHTML = `<option value="">Görev seçilmedi — serbest odak</option>` +
      list.map((t) => `<option value="${esc(t.id)}" ${t.id === FS.taskId ? "selected" : ""}>${esc(t.title)}</option>`).join("");
    $("#fDone").hidden = !FS.taskId;
    const todayStart = startOfDay(Date.now()).getTime();
    const todays = sessions.filter((s) => s.start >= todayStart);
    const mins = todays.reduce((a, s) => a + s.minutes, 0);
    $("#fToday").textContent = todays.length ? `Bugün: ${todays.length} seans · ${fmtMin(mins)} odak` : "Bugün henüz odak seansı yok — ilk seansını başlat!";
    pill.hidden = !ov.hidden || !(FS.running || FS.periodStart);
    pill.classList.toggle("paused", !FS.running);
    if (!FS.running && /^\d\d:\d\d ·/.test(document.title)) document.title = titleBefore || "Taskflow — Görevler ve Notlar";
    paintClock();
    glide($("#focusModes"));
  }

  let lastFocusEl = null;
  function openFocus(taskId) {
    lastFocusEl = document.activeElement;
    if (taskId) setTask(taskId);
    ov.hidden = false;
    document.body.classList.add("modal-open");
    $$(".app, .tabbar").forEach((el) => { el.inert = true; });
    if (!/^\d\d:\d\d ·/.test(document.title)) titleBefore = document.title;
    paintFocus();
    requestAnimationFrame(() => $("#fToggle").focus());
  }
  function closeFocus() {
    ov.hidden = true;
    document.body.classList.remove("modal-open");
    $$(".app, .tabbar").forEach((el) => { el.inert = false; });
    paintFocus();
    if (lastFocusEl && document.contains(lastFocusEl)) lastFocusEl.focus();
  }

  $("#fToggle").addEventListener("click", () => (FS.running ? pause() : start()));
  $("#fReset").addEventListener("click", resetTimer);
  $("#fSkip").addEventListener("click", () => { FS.running = false; complete({ skipped: true }); });
  $("#fSound").addEventListener("click", () => { FS.sound = !FS.sound; persistTimer(); paintFocus(); });
  $("#fMin").addEventListener("click", closeFocus);
  $("#fClose").addEventListener("click", closeFocus);
  $("#fTask").addEventListener("change", (e) => setTask(e.target.value));
  $("#focusModes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-fmode]");
    if (!b || b.dataset.fmode === FS.mode) return;
    logFocus(elapsedMs());
    setMode(b.dataset.fmode);
  });
  $("#fPresets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]");
    if (!b) return;
    if (FS.running) { toast("Süreyi değiştirmek için önce sayacı duraklat", { icon: "timer" }); return; }
    FS.preset = b.dataset.preset;
    setMode(FS.mode);
  });
  $("#fDone").addEventListener("click", () => {
    const t = taskById(FS.taskId);
    if (!t) return;
    if (FS.mode === "focus" && FS.periodStart) { logFocus(elapsedMs()); FS.periodStart = FS.running ? Date.now() : null; if (!FS.running) FS.remaining = dur(); }
    TF.setDone(t, true); TF.markFresh(t.id); TF.render();
    const next = pending()[0];
    FS.taskId = next ? next.id : null;
    persistTimer(); paintFocus();
    toast(next ? `Tamamlandı! Sıradaki: ${next.title}` : "Tamamlandı! Tüm görevler bitti 🎉", { icon: "check" });
  });
  pill.addEventListener("click", () => openFocus());
  ov.addEventListener("mousedown", (e) => { if (e.target === ov) closeFocus(); });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-open-focus], #focusCta")) openFocus();
  });
  document.addEventListener("taskflow:focus", (e) => openFocus(e.detail.taskId));
  document.addEventListener("keydown", (e) => {
    if (ov.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closeFocus(); return; }
    if (e.code === "Space" && !e.target.closest("select, input, textarea, button")) { e.preventDefault(); FS.running ? pause() : start(); }
  });

  // Yeniden yüklemede sayaç kaldığı yerden devam eder
  if (FS.running) {
    if (FS.endAt <= Date.now()) { FS.running = false; complete(); }
    else loop();
  }

  /* =========================================================
     Ortak: segment kaydırıcı
     ========================================================= */
  function glide(seg) {
    const a = seg && seg.querySelector("button.active"), g = seg && seg.querySelector(".seg-glider");
    if (!a || !g || !a.offsetWidth) return;
    g.style.width = `${a.offsetWidth}px`;
    g.style.transform = `translateX(${a.offsetLeft - 5}px)`;
  }

  /* =========================================================
     TAKVİM
     ========================================================= */
  const WD = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const CS = { mode: "month", cursor: new Date(), selected: isoDay(0) };
  const mondayOf = (d) => { const x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const tasksOn = (ds) => TF.state.tasks.filter((t) => t.due === ds)
    .sort((a, b) => Number(a.done) - Number(b.done) || PRIO_RANK[a.priority] - PRIO_RANK[b.priority]);

  const chipHTML = (t) => `<div class="cal-chip ${t.done ? "done" : ""}" data-task="${esc(t.id)}" style="--p:${PRIO_VAR[t.priority]}" title="${esc(t.title)} — sürükleyerek taşı">${t.repeat ? `<span class="cc-rep">${ICONS.repeat}</span>` : ""}${esc(t.title)}</div>`;

  function dayCell(d, { other = false, week = false } = {}) {
    const ds = ymd(d), list = tasksOn(ds), today = ds === isoDay(0);
    const max = week ? 99 : 3;
    const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
    return `<div class="cal-day ${other ? "other" : ""} ${today ? "today" : ""} ${ds === CS.selected ? "selected" : ""} ${week ? "week" : ""}"
        data-date="${ds}" role="gridcell" tabindex="0" aria-label="${label}, ${list.length} görev">
      <div class="cd-head">${week ? `<span class="cd-wd">${WD[(d.getDay() + 6) % 7]}</span>` : ""}<span class="cd-num">${d.getDate()}</span>${list.length ? `<span class="cd-count">${list.length}</span>` : ""}</div>
      <div class="cd-items">${list.slice(0, max).map(chipHTML).join("")}${list.length > max ? `<span class="cd-more">+${list.length - max} daha</span>` : ""}</div>
      <div class="cd-dots">${list.slice(0, 4).map((t) => `<i style="background:${PRIO_VAR[t.priority]}" class="${t.done ? "done" : ""}"></i>`).join("")}</div>
    </div>`;
  }

  function renderCalendar() {
    const c = CS.cursor, board = $("#calBoard");
    let days = [];
    if (CS.mode === "month") {
      const first = new Date(c.getFullYear(), c.getMonth(), 1, 12);
      const start = mondayOf(first);
      for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
      if (days.slice(35).every((d) => d.getMonth() !== c.getMonth())) days = days.slice(0, 35);
      const month = c.toLocaleDateString("tr-TR", { month: "long" });
      $("#calTitle").innerHTML = `${month.charAt(0).toLocaleUpperCase("tr") + month.slice(1)} <span class="grad-text">${c.getFullYear()}</span>`;
      board.className = "cal-board month";
      board.innerHTML = `<div class="cal-weekdays">${WD.map((w) => `<span>${w}</span>`).join("")}</div>
        <div class="cal-grid" role="grid">${days.map((d) => dayCell(d, { other: d.getMonth() !== c.getMonth() })).join("")}</div>`;
    } else {
      const start = mondayOf(c);
      for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
      const a = days[0], b = days[6];
      const sameMonth = a.getMonth() === b.getMonth();
      $("#calTitle").innerHTML = `${a.getDate()}${sameMonth ? "" : " " + a.toLocaleDateString("tr-TR", { month: "short" })} – ${b.getDate()} ${b.toLocaleDateString("tr-TR", { month: "long" })} <span class="grad-text">${b.getFullYear()}</span>`;
      board.className = "cal-board week";
      board.innerHTML = `<div class="cal-grid week" role="grid">${days.map((d) => dayCell(d, { week: true })).join("")}</div>`;
    }
    $$("#calMode [data-calmode]").forEach((x) => x.classList.toggle("active", x.dataset.calmode === CS.mode));
    glide($("#calMode"));
    renderCalSide();
  }

  function renderCalSide() {
    const d = dateOf(CS.selected), list = tasksOn(CS.selected);
    const undated = TF.state.tasks.filter((t) => !t.done && !t.due);
    const title = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
    $("#calSide").innerHTML = `
      <div class="cs-head">
        <div><h3>${title}</h3><p>${CS.selected === isoDay(0) ? "Bugün · " : ""}${list.length ? `${list.length} görev · ${list.filter((t) => t.done).length} tamamlandı` : "Bu gün için görev yok"}</p></div>
      </div>
      <ul class="cs-list">
        ${list.map((t) => `<li class="cs-item ${t.done ? "done" : ""}" style="--p:${PRIO_VAR[t.priority]}">
            <button type="button" class="cs-check" data-cal-toggle="${esc(t.id)}" role="checkbox" aria-checked="${t.done}" aria-label="${esc(t.title)}">${ICONS.check}</button>
            <span class="cs-title">${esc(t.title)}</span>
            ${t.done ? "" : `<button type="button" class="cs-focus" data-cal-focus="${esc(t.id)}" aria-label="Odaklan" title="Odaklan">${ICONS.play}</button>`}
          </li>`).join("") || `<li class="cs-empty">Sağdaki alana görev ekleyebilir veya tarihsiz görevleri buraya sürükleyebilirsin.</li>`}
      </ul>
      <form class="cs-add" id="calAdd" autocomplete="off">
        <span>${ICONS.plus}</span><input type="text" maxlength="120" placeholder="Bu güne görev ekle…" aria-label="Seçili güne görev ekle" />
      </form>
      ${undated.length ? `<div class="cs-undated"><h4>Tarihsiz görevler <small>— bir güne sürükle</small></h4>
        <div class="cs-chips">${undated.map(chipHTML).join("")}</div></div>` : ""}`;
  }

  $("#viewCalendar").addEventListener("click", (e) => {
    const nav = e.target.closest("[data-calnav]");
    if (nav) {
      const n = +nav.dataset.calnav;
      if (n === 0) { CS.cursor = new Date(); CS.selected = isoDay(0); }
      else if (CS.mode === "month") CS.cursor = new Date(CS.cursor.getFullYear(), CS.cursor.getMonth() + n, 1, 12);
      else { const d = new Date(CS.cursor); d.setDate(d.getDate() + 7 * n); CS.cursor = d; }
      renderCalendar(); return;
    }
    const m = e.target.closest("[data-calmode]");
    if (m) { CS.mode = m.dataset.calmode; CS.cursor = dateOf(CS.selected); renderCalendar(); return; }
    const tg = e.target.closest("[data-cal-toggle]");
    if (tg) {
      const t = taskById(tg.dataset.calToggle);
      if (t) { const sp = TF.setDone(t, !t.done); TF.render(); renderCalendar(); if (sp) toast("Tamamlandı · sonraki tekrar takvime eklendi", { icon: "repeat" }); }
      return;
    }
    const fc = e.target.closest("[data-cal-focus]");
    if (fc) { openFocus(fc.dataset.calFocus); return; }
    if (suppressClick) return;
    const day = e.target.closest(".cal-day");
    if (day) { CS.selected = day.dataset.date; renderCalendar(); }
  });
  $("#viewCalendar").addEventListener("keydown", (e) => {
    const day = e.target.closest && e.target.closest(".cal-day");
    if (day && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); CS.selected = day.dataset.date; renderCalendar(); $(`.cal-day[data-date="${CS.selected}"]`)?.focus(); }
  });
  $("#viewCalendar").addEventListener("submit", (e) => {
    if (e.target.id !== "calAdd") return;
    e.preventDefault();
    const inp = e.target.querySelector("input"), title = inp.value.trim();
    if (!title) return;
    TF.addTasks([{ title, due: CS.selected, category: "Genel", priority: "medium" }]);
    renderCalendar();
    toast("Görev takvime eklendi", { icon: "plus" });
    $("#calAdd input").focus();
  });

  // Görev çiplerini sürükleyip başka güne bırakma (fare + dokunmatik)
  let cdrag = null, suppressClick = false;
  document.addEventListener("pointerdown", (e) => {
    const chip = e.target.closest("#viewCalendar .cal-chip");
    if (!chip || e.button !== 0) return;
    cdrag = { chip, id: chip.dataset.task, x: e.clientX, y: e.clientY, ghost: null, over: null };
  });
  document.addEventListener("pointermove", (e) => {
    if (!cdrag) return;
    if (!cdrag.ghost) {
      if (Math.hypot(e.clientX - cdrag.x, e.clientY - cdrag.y) < 6) return;
      const r = cdrag.chip.getBoundingClientRect();
      cdrag.ghost = cdrag.chip.cloneNode(true);
      cdrag.ghost.classList.add("cal-ghost");
      cdrag.ghost.style.width = `${Math.min(r.width, 220)}px`;
      document.body.appendChild(cdrag.ghost);
      cdrag.chip.classList.add("lifted");
      document.body.classList.add("is-dragging");
    }
    e.preventDefault();
    cdrag.ghost.style.transform = `translate(${e.clientX + 10}px, ${e.clientY + 10}px)`;
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const cell = under && under.closest(".cal-day");
    if (cdrag.over !== cell) {
      if (cdrag.over) cdrag.over.classList.remove("drop");
      if (cell) cell.classList.add("drop");
      cdrag.over = cell;
    }
  }, { passive: false });
  const endCal = () => {
    if (!cdrag) return;
    const { ghost, over, id, chip } = cdrag;
    cdrag = null;
    if (!ghost) return; // sadece tıklama
    ghost.remove(); chip.classList.remove("lifted");
    document.body.classList.remove("is-dragging");
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    if (over) {
      over.classList.remove("drop");
      const t = taskById(id), ds = over.dataset.date;
      if (t && t.due !== ds) {
        const prev = t.due;
        TF.updateTask(id, { due: ds });
        CS.selected = ds; renderCalendar();
        toast(`Taşındı: ${dateOf(ds).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}`, {
          icon: "calendarDays",
          action: { label: "Geri al", run: () => { TF.updateTask(id, { due: prev }); renderCalendar(); } },
        });
      }
    }
  };
  document.addEventListener("pointerup", endCal);
  document.addEventListener("pointercancel", endCal);

  /* =========================================================
     VERİMLİLİK PANELİ
     ========================================================= */
  const SS = { range: 7 };
  const dayKey = (ts) => ymd(new Date(ts));
  function countsByDay(list, getTs, getVal = () => 1) {
    const m = new Map();
    list.forEach((x) => { const k = dayKey(getTs(x)); m.set(k, (m.get(k) || 0) + getVal(x)); });
    return m;
  }
  function lastDays(n) {
    const out = [], base = startOfDay(Date.now());
    for (let i = n - 1; i >= 0; i--) { const d = new Date(base); d.setDate(base.getDate() - i); out.push(d); }
    return out;
  }
  function streaks() {
    const set = new Set(activity.map((a) => dayKey(a.t)));
    let cur = 0;
    const d = startOfDay(Date.now());
    if (!set.has(ymd(d))) d.setDate(d.getDate() - 1); // bugün henüz bir şey yoksa dünden say
    while (set.has(ymd(d))) { cur++; d.setDate(d.getDate() - 1); }
    const days = [...set].sort();
    let best = 0, run = 0, prev = null;
    days.forEach((k) => {
      const dt = dateOf(k);
      run = prev && Math.round((dt - prev) / DAY) === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = dt;
    });
    return { cur, best: Math.max(best, cur) };
  }

  // Tek ölçü, tek eksen: ince çubuklar, yuvarlatılmış veri ucu, 2px boşluk, sakin ızgara
  function barChart({ days, values, color, unit, fmtVal = (v) => v, id }) {
    const box = $(`#${id}`), W = Math.max(260, ((box && box.clientWidth) || 560) - 40), H = 200;
    const padL = 30, padB = 26, padT = 10, cw = (W - padL) / days.length;
    // Yuvarlak eksen adımları: 0 · 2 · 4 / 0 · 40 · 80 gibi
    const max = Math.max(1, ...values), rawStep = max / 2, mag = 10 ** Math.floor(Math.log10(rawStep));
    const step = Math.max(1, ([1, 2, 5, 10].find((s) => s * mag >= rawStep) || 10) * mag);
    const nice = Math.max(2, step * 2);
    const y = (v) => padT + (H - padT - padB) * (1 - v / nice);
    const ticks = [0, nice / 2, nice];
    const bw = Math.max(3, Math.min(34, cw - 2 - (days.length > 14 ? 2 : cw * 0.38)));
    const todayK = isoDay(0);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(unit)} grafiği">`;
    ticks.forEach((t) => { s += `<line class="grid" x1="${padL}" x2="${W}" y1="${y(t)}" y2="${y(t)}"/><text class="ax" x="${padL - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`; });
    days.forEach((d, i) => {
      const v = values[i], x = padL + i * cw + (cw - bw) / 2, h = Math.max(0, y(0) - y(v));
      const k = ymd(d), lbl = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" });
      const r = Math.min(4, bw / 2, h);
      if (h > 0) s += `<path class="bar ${k === todayK ? "today" : ""}" fill="${color}" d="M${x},${y(0)} V${y(v) + r} Q${x},${y(v)} ${x + r},${y(v)} H${x + bw - r} Q${x + bw},${y(v)} ${x + bw},${y(v) + r} V${y(0)} Z"/>`;
      s += `<rect class="hit" x="${padL + i * cw}" y="${padT}" width="${cw}" height="${H - padT - padB}" data-tip="${esc(lbl)}|${esc(fmtVal(v))}"/>`;
      const show = days.length <= 7 || i % 5 === (days.length - 1) % 5;
      if (show) s += `<text class="ax ${k === todayK ? "strong" : ""}" x="${padL + i * cw + cw / 2}" y="${H - 8}" text-anchor="middle">${days.length <= 7 ? (k === todayK ? "Bugün" : WD[(d.getDay() + 6) % 7]) : d.getDate()}</text>`;
    });
    s += `<line class="base" x1="${padL}" x2="${W}" y1="${y(0)}" y2="${y(0)}"/></svg>`;
    return s;
  }
  const tableHTML = (head, rows) => `<details class="tbl"><summary>Tablo olarak göster</summary><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></details>`;

  function renderStats() {
    const R = SS.range, days = lastDays(R), prevDays = lastDays(R * 2).slice(0, R);
    const doneBy = countsByDay(activity, (a) => a.t);
    const focusBy = countsByDay(sessions, (s) => s.start, (s) => s.minutes);
    const sumOf = (m, ds) => ds.reduce((a, d) => a + (m.get(ymd(d)) || 0), 0);
    const doneNow = sumOf(doneBy, days), donePrev = sumOf(doneBy, prevDays);
    const focusNow = sumOf(focusBy, days), sessNow = sessions.filter((s) => s.start >= days[0].getTime()).length;
    const st = streaks();
    const delta = donePrev ? Math.round(((doneNow - donePrev) / donePrev) * 100) : null;
    const avg = (doneNow / R).toFixed(1).replace(".", ",");
    const best = days.reduce((b, d) => ((doneBy.get(ymd(d)) || 0) > b.v ? { v: doneBy.get(ymd(d)), d } : b), { v: 0, d: null });

    $("#kpis").innerHTML = `
      <article class="kpi"><div class="kpi-icon" style="--a:#8b5cf6">${ICONS.checkCircle}</div><div>
        <span>Tamamlanan görev</span><strong>${doneNow}</strong>
        <em class="${!delta ? "" : delta > 0 ? "up" : "down"}">${delta === null ? "Karşılaştırma için veri yok" : delta === 0 ? `= önceki ${R} günle aynı` : `${delta > 0 ? "▲" : "▼"} %${Math.abs(delta)} · önceki ${R} güne göre`}</em></div></article>
      <article class="kpi"><div class="kpi-icon" style="--a:#3b82f6">${ICONS.timer}</div><div>
        <span>Odak süresi</span><strong>${fmtMin(focusNow)}</strong><em>${sessNow} Pomodoro seansı</em></div></article>
      <article class="kpi"><div class="kpi-icon" style="--a:#f472b6">${ICONS.flame}</div><div>
        <span>Çalışma serisi</span><strong>${st.cur} gün</strong><em>En uzun seri: ${st.best} gün</em></div></article>
      <article class="kpi"><div class="kpi-icon" style="--a:#22d3ee">${ICONS.trophy}</div><div>
        <span>Günlük ortalama</span><strong>${avg}</strong><em>${best.d ? `En iyi gün: ${best.d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} · ${best.v} görev` : "Henüz veri yok"}</em></div></article>`;

    const dv = days.map((d) => doneBy.get(ymd(d)) || 0), fv = days.map((d) => focusBy.get(ymd(d)) || 0);
    $("#panelDone").innerHTML = `<header class="panel-head"><h3>Tamamlanan görevler</h3><span>Son ${R} gün · günlük</span></header>
      <div class="chart-box" id="chDone">${barChart({ days, values: dv, color: "#8b5cf6", unit: "Tamamlanan görev", fmtVal: (v) => `${v} görev`, id: "panelDone" })}</div>
      ${tableHTML(["Gün", "Görev"], days.map((d, i) => [d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" }), dv[i]]))}`;
    $("#panelFocus").innerHTML = `<header class="panel-head"><h3>Odak süresi</h3><span>Son ${R} gün · dakika</span></header>
      <div class="chart-box" id="chFocus">${barChart({ days, values: fv, color: "#3b82f6", unit: "Odak süresi", fmtVal: (v) => fmtMin(v), id: "panelFocus" })}</div>
      ${tableHTML(["Gün", "Odak"], days.map((d, i) => [d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" }), fmtMin(fv[i])]))}`;

    // Isı haritası: son 12 hafta, tek renk tonu (az → çok)
    const pw = $("#panelHeat").clientWidth || 800;
    const weeks = Math.max(8, Math.min(26, Math.floor((pw - 90) / 34)));
    const start = mondayOf(new Date()); start.setDate(start.getDate() - (weeks - 1) * 7);
    const level = (v) => (v === 0 ? 0 : v <= 1 ? 1 : v <= 3 ? 2 : v <= 5 ? 3 : 4);
    const todayK = isoDay(0);
    let cols = "", months = "", lastM = -1;
    for (let w = 0; w < weeks; w++) {
      let cells = "";
      const wd0 = new Date(start); wd0.setDate(start.getDate() + w * 7);
      if (wd0.getMonth() !== lastM) { months += `<span style="grid-column:${w + 1}">${wd0.toLocaleDateString("tr-TR", { month: "short" })}</span>`; lastM = wd0.getMonth(); }
      for (let i = 0; i < 7; i++) {
        const d = new Date(wd0); d.setDate(wd0.getDate() + i);
        const k = ymd(d), v = doneBy.get(k) || 0, future = k > todayK;
        cells += future ? `<i class="hm future"></i>` : `<i class="hm l${level(v)} ${k === todayK ? "now" : ""}" data-tip="${esc(d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" }))}|${v} görev tamamlandı"></i>`;
      }
      cols += `<div class="hm-col">${cells}</div>`;
    }
    const activeDays = [...doneBy.keys()].filter((k) => k >= ymd(start)).length;
    $("#panelHeat").innerHTML = `<header class="panel-head"><h3>Etkinlik haritası</h3><span>Son ${weeks} hafta · ${activeDays} aktif gün</span></header>
      <div class="heat">
        <div class="hm-rows">${WD.map((w, i) => `<span>${i % 2 === 0 ? w : ""}</span>`).join("")}</div>
        <div class="hm-main"><div class="hm-months" style="grid-template-columns:repeat(${weeks},1fr)">${months}</div><div class="hm-grid" style="grid-template-columns:repeat(${weeks},1fr)">${cols}</div></div>
      </div>
      <div class="hm-legend"><span>Az</span>${[0, 1, 2, 3, 4].map((l) => `<i class="hm l${l}"></i>`).join("")}<span>Çok</span></div>`;

    // Kategori dağılımı (seçili aralıkta tamamlanan)
    const since = days[0].getTime();
    const cat = new Map();
    activity.filter((a) => a.t >= since).forEach((a) => cat.set(a.category || "Genel", (cat.get(a.category || "Genel") || 0) + 1));
    const catRows = [...cat].sort((a, b) => b[1] - a[1]);
    const catMax = Math.max(1, ...catRows.map((c) => c[1]));
    $("#panelCats").innerHTML = `<header class="panel-head"><h3>Kategoriler</h3><span>Son ${R} gün · tamamlanan</span></header>
      ${catRows.length ? `<ul class="hbars">${catRows.map(([k, v]) => `<li data-tip="${esc(k)}|${v} görev · %${Math.round((v / doneNow) * 100)}">
        <span class="hb-label">${esc(k)}</span><span class="hb-track"><i style="width:${(v / catMax) * 100}%;background:${TF.catColor ? TF.catColor(k) : ""}"></i></span><span class="hb-val">${v}</span></li>`).join("")}</ul>`
        : `<p class="panel-empty">Bu aralıkta tamamlanan görev yok.</p>`}`;

    // Öngörüler
    const byWd = [0, 0, 0, 0, 0, 0, 0], wdN = [0, 0, 0, 0, 0, 0, 0];
    lastDays(56).forEach((d) => { const i = (d.getDay() + 6) % 7; byWd[i] += doneBy.get(ymd(d)) || 0; wdN[i]++; });
    const bestWd = byWd.map((v, i) => v / wdN[i]).reduce((b, v, i, arr) => (v > arr[b] ? i : b), 0);
    const WDL = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    const fcat = new Map(); sessions.filter((s) => s.start >= since).forEach((s) => fcat.set(s.category, (fcat.get(s.category) || 0) + s.minutes));
    const topF = [...fcat].sort((a, b) => b[1] - a[1])[0];
    const pend = TF.state.tasks.filter((t) => !t.done), high = pend.filter((t) => t.priority === "high").length;
    const overdue = pend.filter((t) => t.due && t.due < isoDay(0)).length;
    const tips = [
      [ICONS.trophy, `En verimli günün <b>${WDL[bestWd]}</b> — ortalama ${(byWd[bestWd] / wdN[bestWd]).toFixed(1).replace(".", ",")} görev.`],
      topF ? [ICONS.timer, `En çok <b>${esc(topF[0])}</b> kategorisine odaklandın (${fmtMin(topF[1])}).`] : null,
      [ICONS.list, `<b>${pend.length}</b> bekleyen görevin var${high ? `, ${high} tanesi yüksek öncelikli` : ""}.`],
      overdue ? [ICONS.clock, `<b>${overdue}</b> görevin tarihi geçti — takvimden yeni bir güne sürükleyebilirsin.`] : [ICONS.checkCircle, "Geciken görevin yok, harika gidiyorsun!"],
      delta !== null ? [ICONS.chart, delta >= 0 ? `Önceki döneme göre <b>%${delta}</b> daha fazla görev tamamladın.` : `Önceki döneme göre <b>%${Math.abs(delta)}</b> daha az görev tamamladın — küçük adımlarla devam!`] : null,
    ].filter(Boolean);
    $("#panelInsights").innerHTML = `<header class="panel-head"><h3>Öngörüler</h3><span>Senin için özet</span></header>
      <ul class="insights">${tips.map(([ic, tx]) => `<li><span class="in-icon">${ic}</span><p>${tx}</p></li>`).join("")}</ul>
      <button type="button" class="link-btn reset-history" id="resetHistory">Geçmiş istatistikleri sıfırla</button>`;

    $$("#statRange [data-range]").forEach((b) => b.classList.toggle("active", +b.dataset.range === SS.range));
    glide($("#statRange"));
  }

  $("#viewStats").addEventListener("click", async (e) => {
    const r = e.target.closest("[data-range]");
    if (r) { SS.range = +r.dataset.range; renderStats(); return; }
    if (e.target.closest("#resetHistory")) {
      const ok = await TF.confirmDialog({ title: "Geçmiş istatistikler sıfırlansın mı?", text: "Tamamlama kayıtları ve odak seansları silinecek (örnek veriler dahil). Görevlerin ve notların etkilenmez. Bu işlem geri alınamaz.", ok: "Sıfırla" });
      if (!ok) return;
      activity = []; sessions = []; saveHistory(); renderStats(); TF.render();
      toast("Geçmiş istatistikler sıfırlandı", { icon: "chart" });
    }
  });

  // Grafik ipucu (hover / dokunma)
  const tip = $("#chartTip");
  const showTip = (el, x, y) => {
    const [a, b] = el.dataset.tip.split("|");
    tip.innerHTML = `<strong>${b}</strong><span>${a}</span>`;
    tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = `${Math.min(innerWidth - r.width - 8, Math.max(8, x - r.width / 2))}px`;
    tip.style.top = `${Math.max(8, y - r.height - 14)}px`;
    $$(".tip-on").forEach((n) => n.classList.remove("tip-on"));
    el.classList.add("tip-on");
  };
  const hideTip = () => { tip.hidden = true; $$(".tip-on").forEach((n) => n.classList.remove("tip-on")); };
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest("#viewStats [data-tip]");
    if (el) showTip(el, e.clientX, e.clientY); else if (!tip.hidden) hideTip();
  });
  document.addEventListener("scroll", hideTip, { passive: true });

  /* =========================================================
     Görünüm yönetimi
     ========================================================= */
  const renderCurrent = () => {
    const v = currentView();
    if (v === "calendar") renderCalendar();
    else if (v === "stats") renderStats();
  };
  document.addEventListener("taskflow:view", renderCurrent);
  document.addEventListener("taskflow:tasks", () => { if (!ov.hidden) paintFocus(); renderCurrent(); });
  let rz = null;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => { renderCurrent(); glide($("#focusModes")); }, 120);
  });
  if (document.fonts) document.fonts.ready.then(() => { renderCurrent(); glide($("#calMode")); glide($("#statRange")); });

  paintFocus();
  renderCurrent();
  // Odak süresi rozetleri ilk çizimden sonra eklenir (giriş animasyonunu bozmamak için)
  if (currentView() === "tasks") setTimeout(() => TF.render(), capture ? 0 : 650);
  if (params.has("focus")) {
    // Sunum/ekran görüntüsü için: ?focus=first&focusleft=1122&fcycle=2
    openFocus(params.get("focus") === "first" ? (pending()[0] || {}).id : params.get("focus"));
    if (params.get("focusleft")) { FS.mode = "focus"; FS.running = false; FS.remaining = Math.min(dur(), +params.get("focusleft") * 1000); FS.periodStart = Date.now() - (dur() - FS.remaining); }
    if (params.get("fcycle")) FS.cycle = +params.get("fcycle");
    paintFocus();
  }
  if (params.get("calmode") === "week") { CS.mode = "week"; renderCurrent(); }

  TF.views = { openFocus, closeFocus, renderCalendar, renderStats, FS, CS, SS, get activity() { return activity; }, get sessions() { return sessions; } };
})();

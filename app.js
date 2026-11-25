/* =========================================================
   Taskflow — To-Do uygulaması (vanilla JS, LocalStorage)
   ========================================================= */
(() => {
  "use strict";

  /* ---------- İkonlar (inline SVG) ---------- */
  const svg = (inner, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${inner}</svg>`;
  const ICONS = {
    logo: svg('<path d="M20 6 9 17l-5-5"/>', 'stroke="#fff" stroke-width="3"'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.6"'),
    trash: svg('<path d="M3 6h18"/><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"/><path d="m19 6-1 13.5A2 2 0 0 1 16 21H8a2 2 0 0 1-2-1.5L5 6"/><path d="M10 11v6M14 11v6"/>'),
    list: svg('<path d="M9 6h12M9 12h12M9 18h12"/><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    checkCircle: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    calendar: svg('<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>'),
    tag: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.4"/>'),
    flag: svg('<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>'),
    sparkles: svg('<path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'),
    inbox: svg('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>'),
    download: svg('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
    upload: svg('<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>'),
    note: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
    pin: svg('<path d="M12 17v5"/><path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2V17h14v-1.8a2 2 0 0 0-1.1-1.8l-1.8-.9A2 2 0 0 1 15 10.8V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>'),
    archive: svg('<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>'),
    sort: svg('<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10M11 8h7M11 12h4"/>'),
    grid: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    rows: svg('<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>'),
    template: svg('<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18M9 21V9"/>'),
    send: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
    bold: svg('<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z"/><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', 'stroke-width="2.4"'),
    italic: svg('<path d="M19 4h-9M14 20H5M15 4 9 20"/>'),
    strike: svg('<path d="M16 5H9.5a3 3 0 0 0-1.5 5.6"/><path d="M14 13a3.5 3.5 0 0 1-1 6.5H6"/><path d="M4 12h16"/>'),
    heading: svg('<path d="M6 4v16M18 4v16M6 12h12"/>'),
    ul: svg('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
    ol: svg('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 4h1v4M4 8h2"/><path d="M4 14h2l-2 3h2"/>'),
    checkSquare: svg('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>'),
    quote: svg('<path d="M7 7h4v4c0 3-1.5 5-4 6"/><path d="M15 7h4v4c0 3-1.5 5-4 6"/>'),
    code: svg('<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>'),
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    grip: svg('<circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="6" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="18" r="1.3" fill="currentColor"/><circle cx="15" cy="18" r="1.3" fill="currentColor"/>', 'stroke="none"'),
    play: svg('<path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l11.6-7.2a1 1 0 0 0 0-1.72L8.5 3.94A1 1 0 0 0 7 4.8z" fill="currentColor"/>', 'stroke="none"'),
    pause: svg('<rect x="6" y="4.5" width="4" height="15" rx="1.3" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1.3" fill="currentColor"/>', 'stroke="none"'),
    chevronDown: svg('<path d="m6 9 6 6 6-6"/>'),
    chevronLeft: svg('<path d="m15 18-6-6 6-6"/>'),
    chevronRight: svg('<path d="m9 18 6-6-6-6"/>'),
    repeat: svg('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
    timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M10 2h4"/>'),
    chart: svg('<path d="M3 3v18h18"/><path d="M7.5 16v-4M12 16V8M16.5 16V6"/>'),
    flame: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    skip: svg('<path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/>'),
    reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    volume: svg('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
    mute: svg('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>'),
    minimize: svg('<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>'),
    coffee: svg('<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    calendarDays: svg('<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>'),
    undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    themeAuto: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
    bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    palette: svg('<circle cx="13.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="10.5" r="1.2"/><circle cx="8.5" cy="7.5" r="1.2"/><circle cx="6.5" cy="12.5" r="1.2"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A5.6 5.6 0 0 0 22 11.8C22 6.4 17.5 2 12 2z"/>'),
    party: svg('<path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01"/><path d="m22 2-2.2.8a2.9 2.9 0 0 0-1.9 3.2c.1.9-.6 1.6-1.4 1.6h-.4c-.9 0-1.6.8-1.6 1.6V10"/><path d="M11 13c1.9 1.9 2.8 4.2 2 5-.8.8-3.1-.1-5-2s-2.8-4.2-2-5c.8-.8 3.1.1 5 2z"/>'),
  };
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = ICONS[el.dataset.icon] || ""; });

  /* ---------- Yardımcılar ---------- */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const STORAGE_KEY = "taskflow.tasks.v1";
  const PRIO_LABEL = { high: "Yüksek", medium: "Orta", low: "Düşük" };
  const PRIO_ORDER = { high: 0, medium: 1, low: 2 };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isoDay = (offset = 0) => {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  // Yerel tarih → "YYYY-MM-DD"
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  // Türkçe büyük/küçük harf + ı/i farkını yok sayan karşılaştırma
  const norm = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  const REPEAT_LABEL = { daily: "Her gün", weekdays: "Hafta içi", weekly: "Her hafta", monthly: "Her ay" };
  // Tekrarlayan görevin bir sonraki tarihi (geçmişe düşmez)
  function nextDue(due, rep) {
    const today = isoDay(0);
    const d = new Date((due || today) + "T12:00:00");
    const step = () => {
      if (rep === "daily") d.setDate(d.getDate() + 1);
      else if (rep === "weekdays") { do d.setDate(d.getDate() + 1); while (d.getDay() === 0 || d.getDay() === 6); }
      else if (rep === "weekly") d.setDate(d.getDate() + 7);
      else if (rep === "monthly") {
        const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + 1);
        d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
      }
    };
    step();
    while (ymd(d) < today) step();
    return ymd(d);
  }

  /* ---------- Kategoriler (kullanıcı tanımlı, renkli) ---------- */
  const CAT_KEY = "taskflow.categories.v1";
  const DEFAULT_CATS = [
    { name: "İş", color: "#3b82f6" }, { name: "Geliştirme", color: "#22d3ee" },
    { name: "Tasarım", color: "#f472b6" }, { name: "İçerik", color: "#a855f7" },
    { name: "Kişisel", color: "#34d399" },
  ];
  const SPARE_COLORS = ["#f59e0b", "#fb7185", "#8b5cf6", "#14b8a6", "#64748b", "#ec4899", "#84cc16", "#0ea5e9"];
  let categories = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem(CAT_KEY));
      if (Array.isArray(raw) && raw.every((c) => c && typeof c.name === "string")) return raw;
    } catch (_) { /* yok say */ }
    return DEFAULT_CATS.map((c) => ({ ...c }));
  })();
  const saveCats = () => { try { localStorage.setItem(CAT_KEY, JSON.stringify(categories)); } catch (_) { /* yok say */ } };
  const findCat = (name) => categories.find((c) => norm(c.name) === norm(name || ""));
  const catColor = (name) => (findCat(name) || {}).color || "#8487b3";
  function ensureCat(name) {
    const hit = findCat(name);
    if (hit) return hit.name;
    const used = new Set(categories.map((c) => c.color));
    const color = SPARE_COLORS.find((c) => !used.has(c)) || SPARE_COLORS[categories.length % SPARE_COLORS.length];
    categories.push({ name, color });
    saveCats();
    return name;
  }

  /* ---------- Hızlı ekleme: "yarın 14:00 rapor gönder !yüksek #iş" ---------- */
  const MONTHS = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
  const WEEKDAYS = ["pazar", "pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi"];
  const WD_RE = [...WEEKDAYS].sort((a, b) => b.length - a.length).join("|"); // "pazartesi", "pazar"dan önce denenmeli
  const PRIO_WORDS = { "yüksek": "high", "y": "high", "acil": "high", "1": "high", "orta": "medium", "o": "medium", "2": "medium", "düşük": "low", "d": "low", "3": "low" };
  const W = "[a-zçğıöşüâîû]"; // Türkçe harf
  const SUFFIX = `(?:'?${W}*)`; // 14:00'te, cuma'ya gibi ekler
  function parseQuick(text) {
    let rest = " " + text + " ";
    const out = {};
    // Her kalıptan yalnızca bir eşleşme alınır: sondan başa ilk geçerli olan (tarih/saat genelde sonda yazılır)
    const take = (re, fn) => {
      const all = [...rest.matchAll(re)];
      for (let i = all.length - 1; i >= 0; i--) {
        const m = all[i];
        if (fn(...m) === false) continue;
        rest = rest.slice(0, m.index) + " " + rest.slice(m.index + m[0].length);
        return;
      }
    };
    const lc = (x) => x.toLocaleLowerCase("tr");
    const base = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };

    take(new RegExp(`\\s!(${W}+|[123])(?=\\s)`, "giu"), (m, w) => {
      const p = PRIO_WORDS[lc(w)]; if (!p) return false; out.priority = p;
    });
    take(/\s#([\p{L}\p{N}_-]{1,24})(?=\s)/gu, (m, w) => {
      const hit = findCat(w);
      out.category = hit ? hit.name : w.charAt(0).toLocaleUpperCase("tr") + w.slice(1);
      out.newCategory = !hit;
    });
    take(new RegExp(`\\s(her\\s?gün|hafta\\s?içi|her\\s?hafta|her\\s?ay)(?=\\s)`, "giu"), (m, w) => {
      const k = lc(w).replace(/\s/g, "");
      out.repeat = { "hergün": "daily", "haftaiçi": "weekdays", "herhafta": "weekly", "heray": "monthly" }[k];
    });
    take(new RegExp(`\\sher\\s(${WD_RE})${SUFFIX}(?=\\s)`, "giu"), (m, w) => {
      const wd = WEEKDAYS.indexOf(lc(w)), d = base();
      while (d.getDay() !== wd) d.setDate(d.getDate() + 1);
      out.repeat = "weekly"; out.due = ymd(d);
    });
    // Saat: 14:00, 9:30, saat 14, saat 9.30
    take(new RegExp(`\\s(?:saat\\s)?([01]?\\d|2[0-3]):([0-5]\\d)${SUFFIX}(?=\\s)`, "giu"), (m, h, mi) => {
      out.time = `${h.padStart(2, "0")}:${mi}`;
    });
    take(new RegExp(`\\ssaat\\s([01]?\\d|2[0-3])(?:[.]([0-5]\\d))?${SUFFIX}(?=\\s)`, "giu"), (m, h, mi) => {
      out.time = `${h.padStart(2, "0")}:${mi || "00"}`;
    });
    if (!out.due) {
      // Göreli günler
      take(new RegExp(`\\s(bugün|bu\\sakşam|yarın|öbür\\sgün|haftaya)${SUFFIX}(?=\\s)`, "giu"), (m, w) => {
        const k = lc(w).replace(/\s/g, ""), d = base();
        d.setDate(d.getDate() + ({ "bugün": 0, "buakşam": 0, "yarın": 1, "öbürgün": 2, "haftaya": 7 }[k]));
        out.due = ymd(d);
        if (k === "buakşam" && !out.time) out.time = "19:00";
      });
    }
    if (!out.due) {
      take(/\s(\d{1,2})\sgün\ssonra(?=\s)/giu, (m, n) => { const d = base(); d.setDate(d.getDate() + +n); out.due = ymd(d); });
    }
    if (!out.due) {
      // 3 aralık, 3 Aralık 2026
      take(new RegExp(`\\s(\\d{1,2})\\s(${MONTHS.join("|")})(?:\\s(\\d{4}))?${SUFFIX}(?=\\s)`, "giu"), (m, dd, mm, yy) => {
        const mo = MONTHS.indexOf(lc(mm));
        const d = new Date(yy ? +yy : new Date().getFullYear(), mo, +dd, 12);
        if (d.getMonth() !== mo) return false;
        if (!yy && ymd(d) < isoDay(0)) d.setFullYear(d.getFullYear() + 1);
        out.due = ymd(d);
      });
    }
    if (!out.due) {
      // 12.12, 3/1, 12.12.2026
      take(/\s(\d{1,2})[./](\d{2}|\d{1,2}(?=[./]\d{4}))(?:[./](\d{4}))?(?=\s)/gu, (m, dd, mm, yy) => {
        if (+mm < 1 || +mm > 12) return false;
        const d = new Date(yy ? +yy : new Date().getFullYear(), +mm - 1, +dd, 12);
        if (d.getMonth() !== +mm - 1) return false;
        if (!yy && ymd(d) < isoDay(0)) d.setFullYear(d.getFullYear() + 1);
        out.due = ymd(d);
      });
    }
    if (!out.due) {
      take(new RegExp(`\\s(${WD_RE})(?:\\s(?:günü|akşamı|sabahı))?${SUFFIX}(?=\\s)`, "giu"), (m, w) => {
        const wd = WEEKDAYS.indexOf(lc(w)), d = base();
        if (wd < 0) return false;
        while (d.getDay() !== wd) d.setDate(d.getDate() + 1);
        out.due = ymd(d);
      });
    }
    if (out.time && !out.due) out.due = isoDay(0);
    const title = rest.replace(/\s+/g, " ").trim();
    out.title = title || text.trim();
    out.found = ["priority", "category", "repeat", "time", "due"].some((k) => out[k]);
    return out;
  }

  const params = new URLSearchParams(location.search);
  if (params.has("capture")) document.documentElement.classList.add("capture");
  // Sunum/ekran görüntüsü için bölüm gizleme: ?hide=stats,composer
  (params.get("hide") || "").split(",").filter(Boolean).forEach((x) => document.documentElement.classList.add("hide-" + x));

  /* ---------- Örnek görevler ---------- */
  const seed = () => {
    const now = Date.now();
    const t = (title, priority, category, due, done = false, i = 0, extra = {}) => ({
      id: uid() + i, title, priority, category, due, done,
      createdAt: now - i * 3600e3, completedAt: done ? now - i * 1800e3 : null,
      subtasks: [], repeat: null, order: i, ...extra,
    });
    const subs = (...list) => list.map(([title, done], k) => ({ id: uid() + "s" + k, title, done: !!done }));
    return [
      t("Instagram Reels için video senaryosunu yaz", "high", "İçerik", isoDay(0), false, 1,
        { subtasks: subs(["Kanca cümlesini yaz", true], ["Sahne akışını çıkar", true], ["Altyazı metnini hazırla"], ["Müzik seç"]) }),
      t("Müşteri sunumunun son slaytlarını hazırla", "high", "İş", isoDay(1), false, 2,
        { subtasks: subs(["Gelir grafiğini güncelle", true], ["Demo videosunu ekle"], ["Prova yap"]) }),
      t("Mobil uygulama arayüz tasarımını gözden geçir", "medium", "Tasarım", isoDay(2), false, 3),
      t("API dokümantasyonunu güncelle", "medium", "Geliştirme", isoDay(4), false, 4),
      t("Haftalık spor programını planla", "low", "Kişisel", isoDay(5), false, 5, { repeat: "weekly" }),
      t("Ekip toplantısı notlarını paylaş", "low", "İş", isoDay(-1), false, 6, { repeat: "weekdays" }),
      t("Portfolyo sitesini yayına al", "high", "Geliştirme", isoDay(-1), true, 7),
      t("Marka renk paletini belirle", "medium", "Tasarım", isoDay(-2), true, 8),
      t("Q4 bütçe raporunu onayla", "high", "İş", isoDay(-3), true, 9),
      t("E-posta kutusunu düzenle", "low", "Kişisel", isoDay(0), true, 10),
    ];
  };

  /* ---------- Depolama ---------- */
  const load = () => {
    if (params.has("reset")) return seed();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      }
    } catch (_) { /* yok say */ }
    return seed();
  };
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks)); } catch (_) { /* yok say */ }
  };

  /* ---------- Durum ---------- */
  const SORT_KEY = "taskflow.sort", STATUS_KEY = "taskflow.status";
  const STATUSES = ["today", "all", "pending", "completed"];
  let storedSort = null, storedStatus = null;
  try { storedSort = localStorage.getItem(SORT_KEY); storedStatus = localStorage.getItem(STATUS_KEY); } catch (_) { /* yok say */ }
  const state = {
    tasks: load(),
    status: STATUSES.includes(params.get("status")) ? params.get("status") : STATUSES.includes(storedStatus) ? storedStatus : "all",
    cat: null,
    prio: ["all", "high", "medium", "low"].includes(params.get("prio")) ? params.get("prio") : "all",
    query: params.get("q") || "",
    newPrio: "medium",
    sort: storedSort === "manual" ? "manual" : "smart",
    expanded: new Set((params.get("expand") || "").split(",").filter(Boolean)),
  };
  // Eski kayıtları yeni alanlarla tamamla
  state.tasks.forEach((t, i) => {
    if (!Array.isArray(t.subtasks)) t.subtasks = [];
    if (t.repeat === undefined) t.repeat = null;
    if (typeof t.order !== "number") t.order = i;
    if (t.time === undefined) t.time = null;
    if (t.remind === undefined) t.remind = null;
    if (t.category) ensureCat(t.category);
  });
  save();
  let fresh = new Set(state.tasks.map((t) => t.id)); // ilk yüklemede hepsi animasyonla girer

  /* ---------- Tarih / selamlama ---------- */
  const now = new Date();
  $("#today").textContent = now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const h = now.getHours();
  const greet = h < 6 ? "İyi geceler" : h < 12 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
  $("#greeting").innerHTML = `${greet}, <span class="grad-text">bugün neler başaracağız?</span>`;
  $("#dueInput").value = isoDay(0);

  const fmtRemind = (m) => (m === 0 ? "zamanında" : m >= 1440 ? `${m / 1440} gün önce` : m >= 60 ? `${m / 60} saat önce` : `${m} dk önce`);
  const dueBadge = (due, done, t = {}) => {
    if (!due) return "";
    const diff = Math.round((new Date(due + "T12:00:00") - new Date(isoDay(0) + "T12:00:00")) / 864e5);
    const pretty = new Date(due + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    let cls = "", label = pretty;
    if (diff === 0) { cls = "today"; label = "Bugün"; }
    else if (diff === 1) label = "Yarın";
    else if (diff < 0 && !done) { cls = "overdue"; label = `Gecikti · ${pretty}`; }
    if (t.time) label += ` · ${t.time}`;
    const bell = t.time && t.remind != null && !done ? `<i class="bell" title="Hatırlatma: ${fmtRemind(t.remind)}">${ICONS.bell}</i>` : "";
    return `<span class="badge badge-date ${cls}">${ICONS.calendar}${label}${bell}</span>`;
  };

  /* ---------- Render ---------- */
  // Türkçe büyük/küçük harf + ı/i farkını yok sayan arama normalizasyonu
  const isTodayish = (t) => !t.done && t.due && t.due <= isoDay(0);
  const doneToday = (t) => t.done && t.completedAt && ymd(new Date(t.completedAt)) === isoDay(0);
  const matches = (t) =>
    (state.prio === "all" || t.priority === state.prio) &&
    (!state.cat || norm(t.category || "") === norm(state.cat)) &&
    (!state.query || norm(t.title + " " + t.category).includes(norm(state.query)));

  // Odak süresi (dakika) — views.js doldurur
  const focusMinutes = (id) => (window.Taskflow && window.Taskflow.focusMinutes ? window.Taskflow.focusMinutes(id) : 0);
  const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)} sa ${m % 60 ? `${m % 60} dk` : ""}`.trim() : `${m} dk`);

  const detailsHTML = (t) => `
    <div class="task-details">
      <ul class="subtasks">
        ${t.subtasks.map((s) => `
          <li class="sub ${s.done ? "done" : ""}">
            <button type="button" class="sub-check" data-action="sub-toggle" data-sub="${esc(s.id)}" role="checkbox" aria-checked="${s.done}" aria-label="${esc(s.title)}">${ICONS.check}</button>
            <span>${esc(s.title)}</span>
            <button type="button" class="sub-del" data-action="sub-del" data-sub="${esc(s.id)}" aria-label="Alt görevi sil">${ICONS.x}</button>
          </li>`).join("")}
      </ul>
      ${t.done ? "" : `<form class="sub-add" data-form="sub-add" autocomplete="off">
        <span>${ICONS.plus}</span><input type="text" maxlength="100" placeholder="Alt görev ekle ve Enter'a bas…" aria-label="Alt görev ekle" />
      </form>`}
      <div class="detail-row">
        <label class="meta-field sm" title="Tekrar">${ICONS.repeat}
          <select data-change="repeat" aria-label="Tekrar">
            <option value="">Tekrar yok</option>
            ${Object.entries(REPEAT_LABEL).map(([k, v]) => `<option value="${k}" ${t.repeat === k ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </label>
        <label class="meta-field sm" title="Bitiş tarihi">${ICONS.calendar}
          <input type="date" data-change="due" value="${t.due || ""}" aria-label="Bitiş tarihi" />
        </label>
        <label class="meta-field sm" title="Saat">${ICONS.clock}
          <input type="time" data-change="time" value="${t.time || ""}" aria-label="Saat" />
        </label>
        <label class="meta-field sm" title="Hatırlatma">${ICONS.bell}
          <select data-change="remind" aria-label="Hatırlatma">
            <option value="">Hatırlatma yok</option>
            ${[0, 5, 15, 30, 60, 1440].map((m) => `<option value="${m}" ${t.remind === m ? "selected" : ""}>${m === 0 ? "Zamanında" : fmtRemind(m)}</option>`).join("")}
          </select>
        </label>
        <label class="meta-field sm" title="Kategori">${ICONS.tag}
          <select data-change="category" aria-label="Kategori">
            ${categories.map((c) => `<option ${norm(c.name) === norm(t.category || "") ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
          </select>
        </label>
        <button type="button" class="btn-ghost btn-xs detail-del" data-action="delete">${ICONS.trash}Görevi sil</button>
      </div>
    </div>`;

  const taskHTML = (t) => {
    const st = t.subtasks.length, sd = t.subtasks.filter((s) => s.done).length;
    const fm = focusMinutes(t.id), open = state.expanded.has(t.id);
    return `
    <li class="task ${t.done ? "done" : ""} ${fresh.has(t.id) ? "enter" : ""} ${open ? "open" : ""}" data-id="${t.id}" data-prio="${t.priority}">
      ${t.done ? "" : `<button type="button" class="grip" data-grip aria-label="Sürükleyerek sırala (Alt + ↑/↓)" title="Sürükle">${ICONS.grip}</button>`}
      <button class="check" data-action="toggle" aria-label="${t.done ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}">${ICONS.check}</button>
      <div class="task-body">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-meta">
          <span class="badge badge-prio">${ICONS.flag}${PRIO_LABEL[t.priority]}</span>
          <span class="badge badge-cat" style="--cc:${catColor(t.category)}">${ICONS.tag}${esc(t.category)}</span>
          ${dueBadge(t.due, t.done, t)}
          ${t.repeat ? `<span class="badge badge-repeat">${ICONS.repeat}${REPEAT_LABEL[t.repeat]}</span>` : ""}
          ${st ? `<button type="button" class="badge badge-sub ${sd === st ? "all" : ""}" data-action="expand" title="Alt görevler">${ICONS.checkSquare}${sd}/${st}</button>` : ""}
          ${fm ? `<span class="badge badge-focus" title="Bu görevde odaklanılan süre">${ICONS.timer}${fmtMin(fm)}</span>` : ""}
          ${t.noteId ? `<button type="button" class="badge badge-note" data-open-note="${esc(t.noteId)}" title="Kaynak notu aç">${ICONS.note}Not</button>` : ""}
        </div>
      </div>
      <div class="task-actions">
        ${t.done ? "" : `<button class="icon-btn focus-btn" data-action="focus" aria-label="Bu göreve odaklan" title="Odaklan (Pomodoro)">${ICONS.play}</button>`}
        <button class="icon-btn" data-action="expand" aria-expanded="${open}" aria-label="Ayrıntılar ve alt görevler" title="Ayrıntılar">${ICONS.chevronDown}</button>
        <button class="icon-btn del-btn" data-action="delete" aria-label="Görevi sil" title="Sil">${ICONS.trash}</button>
      </div>
      ${open ? detailsHTML(t) : ""}
    </li>`;
  };

  const emptyHTML = (kind) => {
    const filtered = state.prio !== "all" || state.query || state.cat;
    const txt = filtered
      ? ["Eşleşen görev yok", "Filtreleri değiştirerek tekrar dene."]
      : state.status === "today"
        ? kind === "pending" ? ["Bugün için görev kalmadı 🎉", "Bugüne ya da geçmişe tarihli bekleyen görev yok."] : ["Bugün henüz bir şey tamamlanmadı", "İlk görevi bitirdiğinde burada görünecek."]
      : kind === "pending"
        ? ["Tüm görevler tamam! 🎉", "Yeni bir hedef ekleyerek ivmeni koru."]
        : ["Henüz tamamlanan görev yok", "Bir görevi işaretlediğinde burada görünecek."];
    return `<li class="empty"><div class="empty-icon">${kind === "pending" && !filtered ? ICONS.party : ICONS.inbox}</div><strong>${txt[0]}</strong><p>${txt[1]}</p></li>`;
  };

  const smartCmp = (a, b) => PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority] || (a.due || "9").localeCompare(b.due || "9") || (a.time || "99").localeCompare(b.time || "99");
  // Bugün görünümü: önce gecikenler, sonra saate göre, sonra öncelik
  const todayCmp = (a, b) => (a.due < isoDay(0) ? 0 : 1) - (b.due < isoDay(0) ? 0 : 1) || (a.time || "99").localeCompare(b.time || "99") || PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority];
  const sortTasks = (arr, done) =>
    arr.sort((a, b) => done
      ? (b.completedAt || 0) - (a.completedAt || 0)
      : state.sort === "manual" ? a.order - b.order : smartCmp(a, b));
  const minOrder = () => Math.min(0, ...state.tasks.map((t) => t.order)) - 1;

  function render() {
    syncCats();
    const today = state.status === "today";
    const pending = today
      ? state.tasks.filter((t) => isTodayish(t) && matches(t)).sort(state.sort === "manual" ? (a, b) => a.order - b.order : todayCmp)
      : sortTasks(state.tasks.filter((t) => !t.done && matches(t)), false);
    const completed = sortTasks(state.tasks.filter((t) => t.done && matches(t) && (!today || doneToday(t))), true);
    const overdue = today ? pending.filter((t) => t.due < isoDay(0)).length : 0;
    $("#pendingTitle").textContent = today ? (overdue ? `Bugün · ${overdue} geciken` : "Bugün yapılacaklar") : "Bekleyen görevler";
    $("#completedTitle").textContent = today ? "Bugün tamamlananlar" : "Tamamlanan görevler";

    $("#pendingList").innerHTML = pending.length ? pending.map(taskHTML).join("") : emptyHTML("pending");
    $("#completedList").innerHTML = completed.length ? completed.map(taskHTML).join("") : emptyHTML("completed");
    $("#pendingCount").textContent = pending.length;
    $("#completedCount").textContent = completed.length;

    $("#pendingBlock").hidden = state.status === "completed";
    $("#completedBlock").hidden = state.status === "pending";
    $(".lists").classList.toggle("single", state.status === "pending" || state.status === "completed");
    $("#clearDone").hidden = !state.tasks.some((t) => t.done);

    renderStats();
    renderFilters();
    renderSideCats();
    fresh = new Set();
    document.dispatchEvent(new CustomEvent("taskflow:tasks"));
  }

  let shownNumbers = {};
  function countTo(el, value, suffix = "") {
    const key = el.id, from = shownNumbers[key] ?? 0;
    shownNumbers[key] = value;
    if (document.documentElement.classList.contains("capture") || from === value) { el.textContent = value + suffix; return; }
    const start = performance.now(), dur = 700;
    const step = (ts) => {
      const p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (value - from) * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function renderStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.done).length;
    const pending = total - done;
    const pct = total ? Math.round((done / total) * 100) : 0;

    countTo($("#statTotal"), total);
    countTo($("#statDone"), done);
    countTo($("#statPending"), pending);
    countTo($("#statRate"), pct, "%");
    countTo($("#ringPct"), pct, "%");
    countTo($("#mobilePct"), pct, "%");
    $("#statBar").style.width = pct + "%";
    const C = 2 * Math.PI * 50;
    $$(".ring-fill").forEach((c) => { c.style.strokeDashoffset = C - (C * pct) / 100; });

    $("#progressText").textContent =
      total === 0 ? "İlk görevini ekleyerek başla." :
      pct === 100 ? "Muhteşem! Bugünkü her şey tamam. 🎉" :
      pct >= 60 ? `Harika gidiyorsun! ${pending} görev kaldı.` :
      pct >= 30 ? `İyi ilerliyorsun, ${pending} görev seni bekliyor.` :
      `Hadi başlayalım — ${pending} görev sırada.`;

    const counts = {
      all: total, pending, completed: done, today: state.tasks.filter(isTodayish).length,
      high: state.tasks.filter((t) => t.priority === "high").length,
      medium: state.tasks.filter((t) => t.priority === "medium").length,
      low: state.tasks.filter((t) => t.priority === "low").length,
    };
    $$("[data-count]").forEach((el) => { el.textContent = counts[el.dataset.count]; });
  }

  // Görevlerde geçen ama listede olmayan kategorileri ekle (notlardan / takvimden gelenler)
  function syncCats() { state.tasks.forEach((t) => { if (t.category && !findCat(t.category)) ensureCat(t.category); }); }
  function renderCatSelect() {
    const sel = $("#categoryInput"), cur = sel.value;
    sel.innerHTML = categories.map((c) => `<option>${esc(c.name)}</option>`).join("") + `<option value="__new">＋ Yeni kategori…</option>`;
    sel.value = findCat(cur) ? findCat(cur).name : categories[0] ? categories[0].name : "__new";
  }
  function renderSideCats() {
    const box = $("#sideCats");
    if (!box) return;
    box.innerHTML = categories.map((c) => {
      const n = state.tasks.filter((t) => !t.done && norm(t.category || "") === norm(c.name)).length;
      const on = state.cat && norm(state.cat) === norm(c.name);
      return `<button class="nav-item ${on ? "active" : ""}" data-cat="${esc(c.name)}"><i class="dot" style="background:${c.color}"></i>${esc(c.name)}<b>${n}</b></button>`;
    }).join("");
  }

  function renderFilters() {
    $$(".nav-item[data-status]").forEach((b) => b.classList.toggle("active", b.dataset.status === state.status));
    $$(".nav-item[data-prio]").forEach((b) => b.classList.toggle("active", b.dataset.prio === state.prio));
    $$("#segmented button").forEach((b) => b.classList.toggle("active", b.dataset.status === state.status));
    try { localStorage.setItem(STATUS_KEY, state.status); } catch (_) { /* yok say */ }
    $$("#prioChips button").forEach((b) => b.classList.toggle("active", b.dataset.prio === state.prio));
    const sortSel = $("#taskSort");
    if (sortSel && sortSel.value !== state.sort) sortSel.value = state.sort;
    $$(".prio-opt").forEach((b) => {
      const on = b.dataset.value === state.newPrio;
      b.classList.toggle("active", on); b.setAttribute("aria-checked", on);
    });
    moveGlider();
  }

  function moveGlider() {
    const active = $("#segmented button.active"), glider = $(".seg-glider");
    if (!active) return;
    glider.style.width = active.offsetWidth + "px";
    glider.style.transform = `translateX(${active.offsetLeft - 5}px)`;
  }
  window.addEventListener("resize", moveGlider);

  /* ---------- Bildirimler ---------- */
  function toast(message, { icon = "check", action, duration } = {}) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="t-icon">${ICONS[icon]}</span><span>${esc(message)}</span>`;
    if (action) {
      const b = document.createElement("button");
      b.innerHTML = `${ICONS[action.icon || "undo"]}${esc(action.label)}`;
      b.onclick = () => { action.run(); dismiss(); };
      el.appendChild(b);
    }
    $("#toasts").appendChild(el);
    const dismiss = () => { el.classList.add("out"); setTimeout(() => el.remove(), 350); };
    setTimeout(dismiss, duration || (action ? 5000 : 2600));
  }

  /* ---------- Geri alma (Ctrl+Z) ---------- */
  // Her kayıt ya bir anlık görüntü (görevler + kategoriler) ya da özel bir geri alma fonksiyonu taşır.
  const history = [];
  const snapshot = () => ({ tasks: JSON.parse(JSON.stringify(state.tasks)), cats: JSON.parse(JSON.stringify(categories)) });
  function checkpoint(label, undoFn) {
    history.push(undoFn ? { label, undo: undoFn } : { label, snap: snapshot() });
    if (history.length > 40) history.shift();
  }
  function undo() {
    const h = history.pop();
    if (!h) { toast("Geri alınacak bir işlem yok", { icon: "undo" }); return false; }
    if (h.undo) h.undo();
    else {
      state.tasks = h.snap.tasks; categories = h.snap.cats;
      saveCats(); renderCatSelect();
      state.tasks.forEach((t) => fresh.add(t.id));
    }
    save(); render();
    toast(`Geri alındı: ${h.label}`, { icon: "undo" });
    return true;
  }
  // Son kaydı geri alan toast düğmesi (başka işlem araya girdiyse o kaydı bulup geri alır)
  const undoAction = (label) => {
    const entry = history[history.length - 1];
    return {
      label: "Geri al",
      run: () => {
        const i = history.lastIndexOf(entry);
        if (i < 0) return;
        if (i === history.length - 1) { undo(); return; }
        // Araya başka işlemler girdi: yalnızca bu işlemi tersine çevir (özel fonksiyon varsa)
        history.splice(i, 1);
        if (entry.undo) { entry.undo(); save(); render(); toast(`Geri alındı: ${label}`, { icon: "undo" }); }
        else { state.tasks = entry.snap.tasks; categories = entry.snap.cats; saveCats(); renderCatSelect(); save(); render(); toast(`Geri alındı: ${label}`, { icon: "undo" }); }
      },
    };
  };
  document.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== "z") return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable='true']")) return; // yazı alanlarında tarayıcının kendi geri alması
    const busy = ["#editor", "#focus", "#confirm", "#catDlg"].some((id) => { const el = $(id); return el && !el.hidden; });
    if (busy) return;
    const tasksView = !$("#viewTasks").hidden;
    if (!tasksView && !history.length) return;
    e.preventDefault();
    undo();
  });

  /* ---------- Eylemler ---------- */
  function addTask(raw) {
    const q = parseQuick(raw);
    let category = $("#categoryInput").value;
    if (category === "__new") category = categories[0] ? categories[0].name : "Genel";
    if (q.category) category = ensureCat(q.category);
    const time = q.time || $("#timeInput").value || null;
    const remindVal = $("#remindInput").value;
    const t = {
      id: uid(), title: q.title, priority: q.priority || state.newPrio, category,
      due: q.due || $("#dueInput").value || (time ? isoDay(0) : null), time,
      remind: time && remindVal !== "" ? +remindVal : null,
      done: false, createdAt: Date.now(), completedAt: null,
      subtasks: [], repeat: q.repeat || $("#repeatInput").value || null, order: minOrder(),
    };
    checkpoint("görev ekleme");
    state.tasks.unshift(t);
    fresh.add(t.id);
    if (state.status === "completed") state.status = "all";
    save(); renderCatSelect(); render();
    if (t.remind != null) askNotifyPermission();
    const visible = state.status !== "today" || isTodayish(t);
    const when = t.due ? ` · ${dueText(t)}` : "";
    toast(visible ? `Görev eklendi${when}` : `Görev eklendi${when} — Bugün görünümünde değil`, { icon: "plus", action: undoAction("görev ekleme") });
    if (q.newCategory) toast(`Yeni kategori: ${category}`, { icon: "tag" });
  }
  const dueText = (t) => {
    const diff = Math.round((new Date(t.due + "T12:00:00") - new Date(isoDay(0) + "T12:00:00")) / 864e5);
    const d = diff === 0 ? "bugün" : diff === 1 ? "yarın" : new Date(t.due + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });
    return t.time ? `${d} ${t.time}` : d;
  };

  function leave(li, then) {
    li.classList.add("leaving");
    setTimeout(then, 420);
  }

  // Tamamlama mantığı (liste, takvim ve odak modu ortak kullanır)
  function setDone(t, done) {
    t.done = done;
    t.completedAt = done ? Date.now() : null;
    let spawned = null;
    if (done && t.repeat) {
      spawned = {
        ...t, id: uid(), done: false, completedAt: null, createdAt: Date.now(), nextId: null, notified: null, snooze: null,
        due: nextDue(t.due, t.repeat), subtasks: t.subtasks.map((s) => ({ ...s, id: uid(), done: false })),
      };
      t.nextId = spawned.id;
      state.tasks.push(spawned);
      fresh.add(spawned.id);
    } else if (!done && t.nextId) {
      // Geri alındıysa, henüz dokunulmamış bir sonraki tekrarı kaldır
      const nx = state.tasks.find((x) => x.id === t.nextId);
      if (nx && !nx.done) state.tasks = state.tasks.filter((x) => x !== nx);
      t.nextId = null;
    }
    save();
    document.dispatchEvent(new CustomEvent("taskflow:complete", { detail: { task: t, done } }));
    return spawned;
  }

  function toggleTask(id, li) {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    const spawned = setDone(t, !t.done);
    li.classList.toggle("done", t.done);
    li.querySelector(".check").classList.add("pop");
    renderStats();
    setTimeout(() => leave(li, () => { fresh.add(id); render(); }), 380);
    const label = t.done ? "tamamlama" : "tamamlanmadı işareti";
    checkpoint(label, () => {
      const cur = state.tasks.find((x) => x.id === id); // anlık görüntü geri yüklendiyse güncel nesneyi bul
      if (cur) { setDone(cur, !cur.done); fresh.add(id); }
    });
    if (spawned) {
      const d = new Date(spawned.due + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      toast(`Tamamlandı · sonraki tekrar ${d}`, { icon: "repeat", action: undoAction(label) });
    } else if (t.done) toast("Harika! Görev tamamlandı", { icon: "check", action: undoAction(label) });
  }

  function updateTask(id, patch, label = "düzenleme") {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    checkpoint(label);
    Object.assign(t, patch);
    save(); render();
  }

  function toggleSub(t, subId) {
    const s = t.subtasks.find((x) => x.id === subId);
    if (!s) return;
    s.done = !s.done;
    save(); render();
    if (s.done && !t.done && t.subtasks.every((x) => x.done)) {
      toast("Tüm alt görevler bitti!", {
        icon: "checkCircle",
        action: { label: "Görevi tamamla", icon: "check", run: () => { setDone(t, true); fresh.add(t.id); render(); } },
      });
    }
  }

  /* ---------- Sürükle-bırak sıralama (fare + dokunmatik) ---------- */
  function persistDomOrder() {
    checkpoint("sıralama");
    const ids = $$("#pendingList > .task").map((li) => li.dataset.id);
    const visible = new Set(ids);
    const all = state.tasks.filter((t) => !t.done).sort((a, b) => (state.sort === "manual" ? a.order - b.order : smartCmp(a, b)));
    let k = 0;
    const merged = all.map((t) => {
      if (!visible.has(t.id)) return t; // filtrede gizli görevler yerinde kalır
      const id = ids[k++];
      return state.tasks.find((x) => x.id === id);
    });
    merged.forEach((t, i) => { t.order = i; });
    const switched = state.sort !== "manual";
    state.sort = "manual";
    try { localStorage.setItem(SORT_KEY, "manual"); } catch (_) { /* yok say */ }
    save(); render();
    if (switched) toast("Elle sıralamaya geçildi", { icon: "grip" });
  }

  let drag = null;
  document.addEventListener("pointerdown", (e) => {
    const grip = e.target.closest("#pendingList [data-grip]");
    if (!grip || e.button !== 0) return;
    e.preventDefault();
    const li = grip.closest(".task");
    drag = { li, grip, startY: e.clientY, moved: false };
    grip.setPointerCapture(e.pointerId);
  });
  document.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientY - drag.startY) < 4) return;
    if (!drag.moved) { drag.moved = true; drag.li.classList.add("dragging"); document.body.classList.add("is-dragging"); }
    const list = $("#pendingList");
    const others = $$("#pendingList > .task").filter((x) => x !== drag.li);
    const after = others.find((x) => { const r = x.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    if (after) { if (drag.li.nextElementSibling !== after) list.insertBefore(drag.li, after); }
    else if (list.lastElementChild !== drag.li) list.appendChild(drag.li);
    // Kenara yaklaşınca sayfayı kaydır
    if (e.clientY < 70) window.scrollBy(0, -12); else if (e.clientY > innerHeight - 70) window.scrollBy(0, 12);
  });
  const endDrag = () => {
    if (!drag) return;
    const { li, moved } = drag;
    drag = null;
    li.classList.remove("dragging");
    document.body.classList.remove("is-dragging");
    if (moved) persistDomOrder();
  };
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
  // Klavye ile sıralama: tutamaçta Alt + ↑/↓
  document.addEventListener("keydown", (e) => {
    const grip = e.target.closest && e.target.closest("#pendingList [data-grip]");
    if (!grip || !e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    const li = grip.closest(".task"), id = li.dataset.id;
    const sib = e.key === "ArrowUp" ? li.previousElementSibling : li.nextElementSibling;
    if (!sib || !sib.classList.contains("task")) return;
    if (e.key === "ArrowUp") sib.before(li); else sib.after(li);
    persistDomOrder();
    const g = $(`#pendingList .task[data-id="${id}"] [data-grip]`);
    if (g) g.focus();
  });

  function deleteTask(id, li) {
    const idx = state.tasks.findIndex((x) => x.id === id);
    if (idx < 0) return;
    checkpoint("silme");
    const [removed] = state.tasks.splice(idx, 1);
    fresh.add(removed.id);
    save();
    renderStats();
    leave(li, render);
    toast("Görev silindi", { icon: "trash", action: undoAction("silme") });
  }

  /* ---------- Olaylar ---------- */
  $("#composer").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#taskInput"), title = input.value.trim();
    if (!title) {
      const f = $("#composer");
      f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
      input.focus();
      return;
    }
    addTask(title);
    input.value = "";
    input.focus();
  });

  $$(".prio-opt").forEach((b) => b.addEventListener("click", () => { state.newPrio = b.dataset.value; renderFilters(); }));

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (btn) {
      const li = btn.closest(".task");
      if (!li || li.classList.contains("leaving")) return;
      const id = li.dataset.id, t = state.tasks.find((x) => x.id === id);
      const a = btn.dataset.action;
      if (a === "toggle") toggleTask(id, li);
      else if (a === "delete") deleteTask(id, li);
      else if (a === "expand") {
        if (state.expanded.has(id)) state.expanded.delete(id); else state.expanded.add(id);
        render();
        if (state.expanded.has(id)) { const inp = $(`.task[data-id="${id}"] .sub-add input`); if (inp && !t.subtasks.length) inp.focus(); }
      } else if (a === "focus") document.dispatchEvent(new CustomEvent("taskflow:focus", { detail: { taskId: id } }));
      else if (a === "sub-toggle" && t) toggleSub(t, btn.dataset.sub);
      else if (a === "sub-del" && t) {
        checkpoint("alt görev silme");
        t.subtasks = t.subtasks.filter((s) => s.id !== btn.dataset.sub); save(); render();
        toast("Alt görev silindi", { icon: "trash", action: undoAction("alt görev silme") });
      }
      return;
    }
    const c = e.target.closest("#sideCats [data-cat]");
    if (c) { state.cat = state.cat && norm(state.cat) === norm(c.dataset.cat) ? null : c.dataset.cat; render(); return; }
    const s = e.target.closest("[data-status]");
    if (s && (s.classList.contains("nav-item") || s.closest("#segmented"))) { state.status = s.dataset.status; render(); return; }
    const p = e.target.closest("[data-prio]");
    if (p && (p.classList.contains("nav-item") || p.closest("#prioChips"))) {
      state.prio = p.classList.contains("nav-item") && state.prio === p.dataset.prio ? "all" : p.dataset.prio;
      render();
    }
  });

  // Alt görev ekleme formu ve ayrıntı alanları (tekrar, tarih)
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("[data-form='sub-add']");
    if (!f) return;
    e.preventDefault();
    const id = f.closest(".task").dataset.id, t = state.tasks.find((x) => x.id === id);
    const inp = f.querySelector("input"), title = inp.value.trim();
    if (!t || !title) return;
    t.subtasks.push({ id: uid(), title, done: false });
    save(); render();
    const again = $(`.task[data-id="${id}"] .sub-add input`);
    if (again) again.focus();
  });
  document.addEventListener("change", (e) => {
    const el = e.target.closest("[data-change]");
    if (!el || !el.closest(".task")) return;
    const id = el.closest(".task").dataset.id;
    if (el.dataset.change === "repeat") {
      updateTask(id, { repeat: el.value || null }, "tekrar değişikliği");
      if (el.value) toast(`Tekrar: ${REPEAT_LABEL[el.value]}`, { icon: "repeat" });
    }
    if (el.dataset.change === "due") updateTask(id, { due: el.value || null }, "tarih değişikliği");
    if (el.dataset.change === "time") {
      const t = state.tasks.find((x) => x.id === id);
      const patch = { time: el.value || null };
      if (el.value && t && !t.due) patch.due = isoDay(0);
      if (el.value && t && t.remind == null) patch.remind = 0; // saat girildiyse varsayılan: zamanında hatırlat
      updateTask(id, patch, "saat değişikliği");
      if (patch.remind != null || (t && t.remind != null)) askNotifyPermission();
    }
    if (el.dataset.change === "remind") {
      updateTask(id, { remind: el.value === "" ? null : +el.value, notified: null, snooze: null }, "hatırlatma değişikliği");
      if (el.value !== "") {
        askNotifyPermission();
        const t = state.tasks.find((x) => x.id === id);
        if (t && !t.time) toast("Hatırlatma için bir saat de seç", { icon: "clock" });
      }
    }
    if (el.dataset.change === "category") updateTask(id, { category: el.value }, "kategori değişikliği");
  });

  $("#taskSort").value = state.sort;
  $("#taskSort").addEventListener("change", (e) => {
    if (e.target.value === "manual" && state.sort !== "manual") {
      // Elle sıralamaya geçerken mevcut akıllı sırayı başlangıç kabul et
      state.tasks.filter((t) => !t.done).sort(smartCmp).forEach((t, i) => { t.order = i; });
    }
    state.sort = e.target.value;
    try { localStorage.setItem(SORT_KEY, state.sort); } catch (_) { /* yok say */ }
    save(); render();
  });

  $("#searchInput").value = state.query;
  $("#searchInput").addEventListener("input", (e) => { state.query = e.target.value.trim(); render(); });

  $("#clearDone").addEventListener("click", () => {
    const n = state.tasks.filter((t) => t.done).length;
    if (!n) return;
    checkpoint("temizleme");
    state.tasks = state.tasks.filter((t) => !t.done);
    save(); render();
    toast(`${n} tamamlanan görev temizlendi`, { icon: "trash", action: undoAction("temizleme") });
  });

  /* ---------- Hızlı ekleme önizlemesi ---------- */
  const qp = $("#quickPreview");
  function renderQuickPreview() {
    const v = $("#taskInput").value.trim();
    const q = v ? parseQuick(v) : { found: false };
    if (!q.found) { qp.hidden = true; qp.innerHTML = ""; return; }
    const chips = [];
    if (q.due) chips.push(`${ICONS.calendar}${esc(dueText({ due: q.due, time: q.time }))}`);
    else if (q.time) chips.push(`${ICONS.clock}${q.time}`);
    if (q.priority) chips.push(`<i class="dot dot-${q.priority}"></i>${PRIO_LABEL[q.priority]}`);
    if (q.category) chips.push(`<i class="dot" style="background:${q.newCategory ? "#8487b3" : catColor(q.category)}"></i>${esc(q.category)}${q.newCategory ? " (yeni)" : ""}`);
    if (q.repeat) chips.push(`${ICONS.repeat}${REPEAT_LABEL[q.repeat]}`);
    qp.innerHTML = `<span class="qp-label">${ICONS.sparkles}Algılandı:</span>${chips.map((c) => `<span class="qp-chip">${c}</span>`).join("")}<span class="qp-title">“${esc(q.title)}”</span>`;
    qp.hidden = false;
  }
  $("#taskInput").addEventListener("input", renderQuickPreview);
  $("#composer").addEventListener("submit", () => setTimeout(renderQuickPreview, 0));

  /* ---------- Hatırlatıcılar ---------- */
  function askNotifyPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => {
        if (p === "denied") toast("Bildirim izni verilmedi — hatırlatmalar yalnızca uygulama içinde görünecek", { icon: "bell" });
      }).catch(() => {});
    }
  }
  function sysNotify(title, body, tag) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const opts = { body, icon: "icons/icon.svg", badge: "icons/icon.svg", tag, renotify: true };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts)).catch(() => {});
      } else new Notification(title, opts);
    } catch (_) { /* yok say */ }
  }
  const reminderKey = (t) => `${t.due}T${t.time}|${t.remind}`;
  const fireTime = (t) => new Date(`${t.due}T${t.time}:00`).getTime() - t.remind * 60e3;
  function fireReminder(t) {
    const left = Math.round((new Date(`${t.due}T${t.time}:00`).getTime() - Date.now()) / 60e3);
    const body = left > 0 ? `${left >= 60 ? fmtMin(left) : left + " dk"} sonra · ${t.time}` : `Zamanı geldi · ${t.time}`;
    sysNotify(`⏰ ${t.title}`, body, "taskflow-" + t.id);
    toast(`Hatırlatma: ${t.title} — ${body}`, {
      icon: "bell", duration: 15000,
      action: { label: "10 dk ertele", icon: "clock", run: () => { t.snooze = Date.now() + 10 * 60e3; save(); toast("10 dakika sonra tekrar hatırlatılacak", { icon: "clock" }); } },
    });
  }
  function checkReminders() {
    const now = Date.now();
    let changed = false;
    state.tasks.forEach((t) => {
      if (t.done || !t.due || !t.time || t.remind == null) return;
      if (t.snooze && now >= t.snooze) { t.snooze = null; changed = true; fireReminder(t); return; }
      const key = reminderKey(t);
      if (t.notified === key) return;
      const at = fireTime(t);
      if (now < at) return;
      t.notified = key; changed = true;
      if (now - at < 6 * 36e5) fireReminder(t); // 6 saatten eski kaçırılmış hatırlatmaları sessizce geç
    });
    if (changed) save();
  }
  setInterval(checkReminders, 20e3);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkReminders(); });
  setTimeout(checkReminders, 1500);

  /* ---------- Tema (sistem / açık / koyu) ---------- */
  const THEME_KEY = "taskflow.theme";
  const THEME_LABEL = { system: "Sistem", light: "Açık", dark: "Koyu" };
  let themeMode = "system";
  try { themeMode = localStorage.getItem(THEME_KEY) || "system"; } catch (_) { /* yok say */ }
  const mql = window.matchMedia ? matchMedia("(prefers-color-scheme: light)") : null;
  function applyTheme() {
    const light = themeMode === "light" || (themeMode === "system" && mql && mql.matches);
    document.documentElement.setAttribute("data-theme", light ? "light" : "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", light ? "#f4f5fb" : "#0b0b1a");
    const icon = themeMode === "system" ? ICONS.themeAuto : themeMode === "light" ? ICONS.sun : ICONS.moon;
    $$("[data-theme-toggle]").forEach((b) => {
      b.querySelector(".theme-ic").innerHTML = icon;
      b.title = `Tema: ${THEME_LABEL[themeMode]} (değiştirmek için tıkla)`;
      const l = b.querySelector(".theme-lbl"); if (l) l.textContent = THEME_LABEL[themeMode];
    });
  }
  if (mql) (mql.addEventListener ? mql.addEventListener("change", applyTheme) : mql.addListener(applyTheme));
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    themeMode = { system: "light", light: "dark", dark: "system" }[themeMode] || "system";
    try { localStorage.setItem(THEME_KEY, themeMode); } catch (_) { /* yok say */ }
    applyTheme();
    toast(`Tema: ${THEME_LABEL[themeMode]}${themeMode === "system" ? " (cihaz ayarını izler)" : ""}`, { icon: themeMode === "dark" ? "moon" : themeMode === "light" ? "sun" : "themeAuto" });
  });
  applyTheme();

  /* ---------- Kategori yöneticisi ---------- */
  const catDlg = $("#catDlg");
  let catReturnFocus = null;
  function renderCatRows() {
    $("#catRows").innerHTML = categories.map((c, i) => {
      const n = state.tasks.filter((t) => norm(t.category || "") === norm(c.name)).length;
      return `<li data-i="${i}">
        <input type="color" value="${c.color}" data-cat-color aria-label="${esc(c.name)} rengi" />
        <input type="text" value="${esc(c.name)}" maxlength="24" data-cat-name aria-label="Kategori adı" />
        <span class="cat-n" title="Bu kategorideki görev sayısı">${n}</span>
        <button type="button" class="ed-btn danger" data-cat-del aria-label="${esc(c.name)} kategorisini sil" title="Sil">${ICONS.trash}</button>
      </li>`;
    }).join("");
  }
  function openCats(focusNew) {
    catReturnFocus = document.activeElement;
    renderCatRows();
    catDlg.hidden = false;
    (focusNew ? $("#catNewName") : $("#catDone")).focus();
  }
  function closeCats() {
    catDlg.hidden = true;
    renderCatSelect(); render();
    if (catReturnFocus && catReturnFocus.focus) catReturnFocus.focus();
  }
  $("#catManage").addEventListener("click", () => openCats(false));
  $("#catDone").addEventListener("click", closeCats);
  catDlg.addEventListener("click", (e) => { if (e.target === catDlg) closeCats(); });
  catDlg.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.preventDefault(); closeCats(); } });
  $("#catAdd").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#catNewName").value.trim();
    if (!name) return;
    if (findCat(name)) { toast(`“${name}” zaten var`, { icon: "tag" }); return; }
    checkpoint("kategori ekleme");
    categories.push({ name, color: $("#catNewColor").value });
    saveCats(); renderCatRows(); renderCatSelect();
    $("#categoryInput").value = name;
    $("#catNewName").value = "";
    $("#catNewColor").value = SPARE_COLORS[categories.length % SPARE_COLORS.length];
    $("#catNewName").focus();
  });
  $("#catRows").addEventListener("change", (e) => {
    const li = e.target.closest("li"); if (!li) return;
    const c = categories[+li.dataset.i]; if (!c) return;
    if (e.target.matches("[data-cat-color]")) { checkpoint("renk değişikliği"); c.color = e.target.value; saveCats(); }
    if (e.target.matches("[data-cat-name]")) {
      const name = e.target.value.trim();
      if (!name || (findCat(name) && findCat(name) !== c)) { e.target.value = c.name; toast(name ? `“${name}” zaten var` : "Ad boş olamaz", { icon: "tag" }); return; }
      checkpoint("kategori adı değişikliği");
      state.tasks.forEach((t) => { if (norm(t.category || "") === norm(c.name)) t.category = name; });
      if (state.cat && norm(state.cat) === norm(c.name)) state.cat = name;
      c.name = name; saveCats(); save();
    }
    render();
  });
  $("#catRows").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat-del]"); if (!b) return;
    const c = categories[+b.closest("li").dataset.i]; if (!c) return;
    if (norm(c.name) === "genel" && state.tasks.some((t) => norm(t.category || "") === "genel")) { toast("“Genel” kategorisinde görev varken silinemez", { icon: "tag" }); return; }
    checkpoint("kategori silme");
    const moved = state.tasks.filter((t) => norm(t.category || "") === norm(c.name));
    categories = categories.filter((x) => x !== c);
    if (moved.length) { const g = ensureCat("Genel"); moved.forEach((t) => { t.category = g; }); }
    if (state.cat && norm(state.cat) === norm(c.name)) state.cat = null;
    saveCats(); save(); renderCatRows(); renderCatSelect(); render();
    toast(`“${c.name}” silindi${moved.length ? ` · ${moved.length} görev Genel'e taşındı` : ""}`, { icon: "trash", action: undoAction("kategori silme") });
  });
  $("#categoryInput").addEventListener("change", (e) => { if (e.target.value === "__new") openCats(true); });

  /* ---------- Başlat ---------- */
  renderCatSelect();
  if (params.get("prio-new") && PRIO_LABEL[params.get("prio-new")]) state.newPrio = params.get("prio-new");
  if (params.get("draft")) $("#taskInput").value = params.get("draft");
  if (params.get("expand") === "first") {
    const f = state.tasks.filter((t) => !t.done).sort(state.sort === "manual" ? (a, b) => a.order - b.order : smartCmp)[0];
    state.expanded = new Set(f ? [f.id] : []);
  }
  render();
  if (document.fonts) document.fonts.ready.then(moveGlider);
  if (params.get("toast")) toast(params.get("toast"), { icon: "check" });

  /* ---------- Uygulama (PWA) kurulumu ---------- */
  let installPrompt = null;
  const installBtn = $("#installBtn");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    installPrompt = null;
    installBtn.hidden = true;
    if (outcome === "accepted") toast("Taskflow cihazına yükleniyor", { icon: "download" });
  });
  window.addEventListener("appinstalled", () => { installBtn.hidden = true; });

  // Claude'da yayınlanan sürümde service worker çalışmaz; yalnızca yerel/PWA sürümünde kaydet
  if (!window.TASKFLOW_EMBED) {
    try {
      if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
      }
    } catch (_) { /* korumalı ortam */ }
  }

  // Test / otomasyon için dışa açık küçük API
  // Notlar modülü (notes.js) bu API üzerinden görev ekler ve ortak araçları kullanır.
  function addTasks(list) {
    const created = list.map((x) => ({
      id: uid(), title: x.title, priority: PRIO_LABEL[x.priority] ? x.priority : "medium",
      category: x.category || "Notlar", due: x.due || null, done: false,
      createdAt: Date.now(), completedAt: null, noteId: x.noteId || null,
      subtasks: [], repeat: null, order: minOrder(), time: null, remind: null,
    }));
    created.forEach((t) => ensureCat(t.category));
    state.tasks.unshift(...created);
    created.forEach((t) => fresh.add(t.id));
    save(); render();
    return created.length;
  }
  window.Taskflow = {
    state, render, save, addTasks, toast, esc, uid, ICONS, isoDay, ymd,
    setDone, updateTask, PRIO_LABEL, REPEAT_LABEL, fmtMin, markFresh: (id) => fresh.add(id),
    catColor, parseQuick, checkpoint, undo, get categories() { return categories; },
  };
})();

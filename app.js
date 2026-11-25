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
  const SORT_KEY = "taskflow.sort";
  let storedSort = null;
  try { storedSort = localStorage.getItem(SORT_KEY); } catch (_) { /* yok say */ }
  const state = {
    tasks: load(),
    status: ["all", "pending", "completed"].includes(params.get("status")) ? params.get("status") : "all",
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

  const dueBadge = (due, done) => {
    if (!due) return "";
    const diff = Math.round((new Date(due + "T12:00:00") - new Date(isoDay(0) + "T12:00:00")) / 864e5);
    const pretty = new Date(due + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    let cls = "", label = pretty;
    if (diff === 0) { cls = "today"; label = "Bugün"; }
    else if (diff === 1) label = "Yarın";
    else if (diff < 0 && !done) { cls = "overdue"; label = `Gecikti · ${pretty}`; }
    return `<span class="badge badge-date ${cls}">${ICONS.calendar}${label}</span>`;
  };

  /* ---------- Render ---------- */
  // Türkçe büyük/küçük harf + ı/i farkını yok sayan arama normalizasyonu
  const norm = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  const matches = (t) =>
    (state.prio === "all" || t.priority === state.prio) &&
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
          <span class="badge badge-cat">${ICONS.tag}${esc(t.category)}</span>
          ${dueBadge(t.due, t.done)}
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
    const filtered = state.prio !== "all" || state.query;
    const txt = filtered
      ? ["Eşleşen görev yok", "Filtreleri değiştirerek tekrar dene."]
      : kind === "pending"
        ? ["Tüm görevler tamam! 🎉", "Yeni bir hedef ekleyerek ivmeni koru."]
        : ["Henüz tamamlanan görev yok", "Bir görevi işaretlediğinde burada görünecek."];
    return `<li class="empty"><div class="empty-icon">${kind === "pending" && !filtered ? ICONS.party : ICONS.inbox}</div><strong>${txt[0]}</strong><p>${txt[1]}</p></li>`;
  };

  const smartCmp = (a, b) => PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority] || (a.due || "9").localeCompare(b.due || "9");
  const sortTasks = (arr, done) =>
    arr.sort((a, b) => done
      ? (b.completedAt || 0) - (a.completedAt || 0)
      : state.sort === "manual" ? a.order - b.order : smartCmp(a, b));
  const minOrder = () => Math.min(0, ...state.tasks.map((t) => t.order)) - 1;

  function render() {
    const pending = sortTasks(state.tasks.filter((t) => !t.done && matches(t)), false);
    const completed = sortTasks(state.tasks.filter((t) => t.done && matches(t)), true);

    $("#pendingList").innerHTML = pending.length ? pending.map(taskHTML).join("") : emptyHTML("pending");
    $("#completedList").innerHTML = completed.length ? completed.map(taskHTML).join("") : emptyHTML("completed");
    $("#pendingCount").textContent = pending.length;
    $("#completedCount").textContent = completed.length;

    $("#pendingBlock").hidden = state.status === "completed";
    $("#completedBlock").hidden = state.status === "pending";
    $(".lists").classList.toggle("single", state.status !== "all");
    $("#clearDone").hidden = !state.tasks.some((t) => t.done);

    renderStats();
    renderFilters();
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
      all: total, pending, completed: done,
      high: state.tasks.filter((t) => t.priority === "high").length,
      medium: state.tasks.filter((t) => t.priority === "medium").length,
      low: state.tasks.filter((t) => t.priority === "low").length,
    };
    $$("[data-count]").forEach((el) => { el.textContent = counts[el.dataset.count]; });
  }

  function renderFilters() {
    $$(".nav-item[data-status]").forEach((b) => b.classList.toggle("active", b.dataset.status === state.status));
    $$(".nav-item[data-prio]").forEach((b) => b.classList.toggle("active", b.dataset.prio === state.prio));
    $$("#segmented button").forEach((b) => b.classList.toggle("active", b.dataset.status === state.status));
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
  function toast(message, { icon = "check", action } = {}) {
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
    setTimeout(dismiss, action ? 5000 : 2600);
  }

  /* ---------- Eylemler ---------- */
  function addTask(title) {
    const t = {
      id: uid(), title, priority: state.newPrio, category: $("#categoryInput").value,
      due: $("#dueInput").value || null, done: false, createdAt: Date.now(), completedAt: null,
      subtasks: [], repeat: $("#repeatInput").value || null, order: minOrder(),
    };
    state.tasks.unshift(t);
    fresh.add(t.id);
    if (state.status === "completed") state.status = "all";
    save(); render();
    toast("Görev eklendi", { icon: "plus" });
  }

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
        ...t, id: uid(), done: false, completedAt: null, createdAt: Date.now(), nextId: null,
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
    if (spawned) {
      const d = new Date(spawned.due + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      toast(`Tamamlandı · sonraki tekrar ${d}`, { icon: "repeat" });
    } else if (t.done) toast("Harika! Görev tamamlandı", { icon: "check" });
  }

  function updateTask(id, patch) {
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
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
    const [removed] = state.tasks.splice(idx, 1);
    save();
    renderStats();
    leave(li, render);
    toast("Görev silindi", {
      icon: "trash",
      action: { label: "Geri al", run: () => { state.tasks.splice(idx, 0, removed); fresh.add(removed.id); save(); render(); } },
    });
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
      else if (a === "sub-del" && t) { t.subtasks = t.subtasks.filter((s) => s.id !== btn.dataset.sub); save(); render(); }
      return;
    }
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
      updateTask(id, { repeat: el.value || null });
      if (el.value) toast(`Tekrar: ${REPEAT_LABEL[el.value]}`, { icon: "repeat" });
    }
    if (el.dataset.change === "due") updateTask(id, { due: el.value || null });
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
    const before = state.tasks.slice();
    state.tasks = state.tasks.filter((t) => !t.done);
    save(); render();
    toast(`${n} tamamlanan görev temizlendi`, {
      icon: "trash",
      action: { label: "Geri al", run: () => { state.tasks = before; save(); render(); } },
    });
  });

  /* ---------- Başlat ---------- */
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
      subtasks: [], repeat: null, order: minOrder(),
    }));
    state.tasks.unshift(...created);
    created.forEach((t) => fresh.add(t.id));
    save(); render();
    return created.length;
  }
  window.Taskflow = {
    state, render, save, addTasks, toast, esc, uid, ICONS, isoDay, ymd,
    setDone, updateTask, PRIO_LABEL, REPEAT_LABEL, fmtMin, markFresh: (id) => fresh.add(id),
  };
})();

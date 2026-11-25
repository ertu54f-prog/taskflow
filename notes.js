/* =========================================================
   Taskflow — Notlar modülü
   Markdown notlar, yapılacak kutuları, #etiketler, sabitleme,
   renkler, arşiv, 30 günlük çöp kutusu, şablonlar, dışa/içe aktarma
   ve notlardaki yapılacakları göreve dönüştürme.
   ========================================================= */
(() => {
  "use strict";
  const TF = window.Taskflow;
  if (!TF) return;
  const { ICONS, toast, esc, uid } = TF;

  /* ---------- Yardımcılar ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const DAY = 864e5;
  const KEY = "taskflow.notes.v1", VIEW_KEY = "taskflow.view", LAYOUT_KEY = "taskflow.notes.layout";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* yok say */ } },
  };
  const norm = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  const fmtDate = (ts) => new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const ago = (ts) => {
    const m = Math.round((Date.now() - ts) / 6e4);
    if (m < 1) return "az önce";
    if (m < 60) return `${m} dk önce`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} sa önce`;
    const d = Math.round(h / 24);
    if (d === 1) return "dün";
    if (d < 7) return `${d} gün önce`;
    return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };
  const slug = (s) => norm(s).replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  // Claude'da yayınlanan sürümde dosya indirme engelli: içerik panoya kopyalanır.
  const EMBED = !!window.TASKFLOW_EMBED;
  async function copyOut(content, what) {
    try { await navigator.clipboard.writeText(content); toast(`${what} panoya kopyalandı`, { icon: "check" }); }
    catch (_) { toast("Kopyalanamadı — tarayıcı panoya erişime izin vermedi", { icon: "x" }); }
  }
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Renkler ve şablonlar ---------- */
  const COLORS = [
    { id: "none", label: "Varsayılan", hex: "#8487b3" },
    { id: "purple", label: "Mor", hex: "#a855f7" },
    { id: "blue", label: "Mavi", hex: "#3b82f6" },
    { id: "cyan", label: "Turkuaz", hex: "#22d3ee" },
    { id: "green", label: "Yeşil", hex: "#34d399" },
    { id: "pink", label: "Pembe", hex: "#f472b6" },
    { id: "rose", label: "Kırmızı", hex: "#fb7185" },
  ];
  const colorHex = (id) => (COLORS.find((c) => c.id === id) || COLORS[0]).hex;
  const today = () => fmtDate(Date.now());
  const TEMPLATES = [
    { id: "meeting", name: "Toplantı notu", desc: "Gündem, kararlar ve aksiyonlar", color: "blue", title: () => `Toplantı — ${today()}`,
      body: "## Katılımcılar\n- \n\n## Gündem\n1. \n\n## Kararlar\n- \n\n## Aksiyonlar\n- [ ] \n\n#toplantı" },
    { id: "journal", name: "Günlük", desc: "Günün özeti ve yarının odağı", color: "purple", title: () => `Günlük — ${today()}`,
      body: "## Bugün neler oldu?\n\n\n## Minnettar olduklarım\n- \n\n## Yarın için odak\n- [ ] \n\n#günlük" },
    { id: "idea", name: "Fikir", desc: "Problem, çözüm, sonraki adımlar", color: "green", title: () => "Yeni fikir",
      body: "## Problem\n\n\n## Çözüm önerisi\n\n\n## Sonraki adımlar\n- [ ] \n\n#fikir" },
    { id: "checklist", name: "Kontrol listesi", desc: "Hızlı yapılacaklar listesi", color: "cyan", title: () => "Kontrol listesi",
      body: "- [ ] \n- [ ] \n- [ ] " },
  ];

  /* ---------- Örnek notlar ---------- */
  const seed = () => {
    const now = Date.now(), H = 36e5;
    const n = (o, i) => ({
      id: uid() + i, title: "", body: "", color: "none", pinned: false, archived: false, deletedAt: null,
      createdAt: now - i * H * 6, updatedAt: now - i * H * 2, ...o,
    });
    return [
      n({ title: "Reels çekim planı", color: "purple", pinned: true,
        body: "Taskflow tanıtım videosu için çekim akışı.\n\n## Sahneler\n- [x] Masaüstü panel açılışı\n- [x] Görev ekleme animasyonu\n- [ ] Notlar ekranına geçiş\n- [ ] Mobil görünümle kapanış\n\n> İlk 3 saniye **kanca** olmalı: ilerleme halkası dolarken başla.\n\n#içerik #reels" }, 0),
      n({ title: "Haftalık ekip toplantısı", color: "blue", pinned: true,
        body: "## Gündem\n1. Sprint değerlendirmesi\n2. Yeni özelliklerin önceliklendirilmesi\n3. Tasarım geri bildirimleri\n\n## Aksiyonlar\n- [ ] Notlar modülü için kullanıcı testi planla\n- [ ] API sürüm notlarını yayınla\n- [x] Toplantı özetini paylaş\n\n#iş #toplantı" }, 1),
      n({ title: "Uygulama fikirleri", color: "green",
        body: "- Görevler için **tekrarlayan** hatırlatıcılar\n- Odak modu: tek görev, tam ekran\n- Haftalık verimlilik raporu\n- Takvim entegrasyonu\n\n#fikir #ürün" }, 2),
      n({ title: "Okuma listesi", color: "pink",
        body: "- [x] Atomik Alışkanlıklar\n- [ ] Derin Çalışma\n- [ ] Refactoring UI\n- [ ] Hooked\n\n#kişisel #kitap" }, 3),
      n({ title: "Marka renk paleti", color: "cyan",
        body: "Ana geçiş: `#a855f7 → #3b82f6`\n\n- **Mor** — vurgu ve butonlar\n- **Mavi** — ilerleme ve bağlantılar\n- **Turkuaz** — bekleyen durumlar\n\n#tasarım" }, 4),
      n({ title: "Sunum için kısa notlar", color: "rose",
        body: "Açılışta problemi anlat, ardından **3 dakikalık demo**.\n\nKapanış: ~~fiyatlandırma~~ yol haritası.\n\n#iş" }, 5),
      n({ title: "Eski kampanya fikirleri", archived: true, body: "Yaz kampanyası için taslak başlıklar.\n\n#fikir" }, 8),
      n({ title: "Taslak not", deletedAt: now - 2 * DAY, body: "Bu not çöp kutusunda bekliyor." }, 9),
    ];
  };

  /* ---------- Durum ve depolama ---------- */
  function load() {
    let notes = null;
    if (!params.has("reset")) {
      try { const d = JSON.parse(store.get(KEY) || "null"); if (Array.isArray(d)) notes = d; } catch (_) { /* yok say */ }
    }
    const limit = Date.now() - 30 * DAY; // 30 günü geçen çöp notları otomatik silinir
    return (notes || seed()).filter((n) => !n.deletedAt || n.deletedAt > limit);
  }
  const S = {
    notes: load(),
    filter: ["all", "pinned", "archived", "trash"].includes(params.get("nfilter")) ? params.get("nfilter") : "all",
    tag: null, query: "", sort: "updated",
    layout: store.get(LAYOUT_KEY) === "list" ? "list" : "grid",
    view: "tasks", editing: null, mode: "edit",
  };
  const saveNotes = () => store.set(KEY, JSON.stringify(S.notes));
  saveNotes();
  const byId = (id) => S.notes.find((n) => n.id === id);
  const isActive = (n) => !n.deletedAt && !n.archived;
  const touch = (n) => { n.updatedAt = Date.now(); saveNotes(); };

  /* ---------- Markdown ---------- */
  const CHECK_RE = /^(\s*[-*] \[)( |x|X)(\] ?)(.*)$/;
  const TAG_RE = /(^|\s)#([\p{L}\p{N}_-]+)/gu;
  const TAGLINE_RE = /^\s*(#[\p{L}\p{N}_-]+\s*)+$/u;
  const stripCode = (s) => s.replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
  // Etiketler Türkçe karakterleriyle (ı, ş, ğ…) korunur; yalnızca küçük harfe çevrilir.
  const tagKey = (s) => s.toLocaleLowerCase("tr");
  const tagsOf = (body) => [...new Set([...stripCode(body).matchAll(TAG_RE)].map((m) => tagKey(m[2])))];
  const checklist = (body) => body.split("\n").reduce((acc, l) => {
    const m = l.match(CHECK_RE);
    if (m) { acc.total++; if (m[2] !== " ") acc.done++; }
    return acc;
  }, { total: 0, done: 0 });

  function inline(text) {
    const codes = [];
    let s = esc(text).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    s = s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(TAG_RE, '$1<span class="md-tag" data-tag="$2">#$2</span>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
  }

  function renderMd(src, { interactive = true, maxLines = Infinity, skipTagLines = false } = {}) {
    const lines = src.split("\n");
    let html = "", list = null, inCode = false, code = [], shown = 0, truncated = false;
    const close = () => { if (list) { html += list === "ol" ? "</ol>" : "</ul>"; list = null; } };
    const open = (t) => { if (list !== t) { close(); html += t === "check" ? '<ul class="md-check">' : `<${t}>`; list = t; } };
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (raw.trim().startsWith("```")) {
        if (inCode) { html += `<pre><code>${esc(code.join("\n"))}</code></pre>`; code = []; inCode = false; shown++; }
        else { close(); inCode = true; }
        continue;
      }
      if (inCode) { code.push(raw); continue; }
      if (skipTagLines && TAGLINE_RE.test(raw)) continue;
      if (!raw.trim()) { close(); continue; }
      if (shown >= maxLines) { truncated = true; break; }
      shown++;
      let m;
      if ((m = raw.match(CHECK_RE))) {
        open("check");
        const done = m[2] !== " ";
        const box = interactive
          ? `<button type="button" class="md-box" data-line="${i}" role="checkbox" aria-checked="${done}" aria-label="${done ? "Yapılmadı olarak işaretle" : "Yapıldı olarak işaretle"}">${ICONS.check}</button>`
          : `<span class="md-box">${ICONS.check}</span>`;
        html += `<li class="${done ? "done" : ""}">${box}<span>${inline(m[4]) || "&nbsp;"}</span></li>`;
      } else if ((m = raw.match(/^\s*[-*] (.*)$/))) { open("ul"); html += `<li>${inline(m[1])}</li>`; }
      else if ((m = raw.match(/^\s*\d+[.)] (.*)$/))) { open("ol"); html += `<li>${inline(m[1])}</li>`; }
      else if ((m = raw.match(/^(#{1,3}) (.*)$/))) { close(); const l = m[1].length + 1; html += `<h${l}>${inline(m[2])}</h${l}>`; }
      else if ((m = raw.match(/^> ?(.*)$/))) { close(); html += `<blockquote>${inline(m[1])}</blockquote>`; }
      else { close(); html += `<p>${inline(raw)}</p>`; }
    }
    if (inCode && code.length) html += `<pre><code>${esc(code.join("\n"))}</code></pre>`;
    close();
    return { html, truncated };
  }

  function toggleLine(n, i, bump = true) {
    const lines = n.body.split("\n");
    const m = lines[i] && lines[i].match(CHECK_RE);
    if (!m) return;
    lines[i] = m[1] + (m[2] === " " ? "x" : " ") + m[3] + m[4];
    n.body = lines.join("\n");
    bump ? touch(n) : saveNotes();
  }

  /* ---------- Liste / ızgara ---------- */
  function visibleNotes() {
    let list = S.notes.filter((n) =>
      S.filter === "trash" ? !!n.deletedAt :
      S.filter === "archived" ? n.archived && !n.deletedAt :
      S.filter === "pinned" ? n.pinned && isActive(n) : isActive(n));
    if (S.tag) list = list.filter((n) => tagsOf(n.body).includes(S.tag));
    if (S.query) { const q = norm(S.query); list = list.filter((n) => norm(`${n.title} ${n.body}`).includes(q)); }
    const cmp = {
      updated: (a, b) => b.updatedAt - a.updatedAt,
      created: (a, b) => b.createdAt - a.createdAt,
      title: (a, b) => (a.title || "￿").localeCompare(b.title || "￿", "tr"),
    }[S.sort];
    return list.sort(cmp);
  }

  function cardHTML(n) {
    const inTrash = !!n.deletedAt;
    const { html, truncated } = renderMd(n.body, { interactive: !inTrash, maxLines: S.layout === "list" ? 4 : 8, skipTagLines: true });
    const tags = tagsOf(n.body), cl = checklist(n.body), title = n.title || "Başlıksız not";
    const actions = inTrash
      ? `<button type="button" class="nc-act" data-nact="restore" title="Geri yükle" aria-label="Geri yükle">${ICONS.undo}</button>
         <button type="button" class="nc-act danger" data-nact="destroy" title="Kalıcı olarak sil" aria-label="Kalıcı olarak sil">${ICONS.trash}</button>`
      : `<button type="button" class="nc-act ${n.pinned ? "on" : ""}" data-nact="pin" title="${n.pinned ? "Sabitlemeyi kaldır" : "Sabitle"}" aria-label="${n.pinned ? "Sabitlemeyi kaldır" : "Sabitle"}">${ICONS.pin}</button>
         <button type="button" class="nc-act" data-nact="archive" title="${n.archived ? "Arşivden çıkar" : "Arşivle"}" aria-label="${n.archived ? "Arşivden çıkar" : "Arşivle"}">${ICONS.archive}</button>
         <button type="button" class="nc-act danger" data-nact="trash" title="Çöpe taşı" aria-label="Çöpe taşı">${ICONS.trash}</button>`;
    const left = inTrash ? Math.max(0, 30 - Math.floor((Date.now() - n.deletedAt) / DAY)) : 0;
    return `<article class="note-card ${inTrash ? "in-trash" : ""}" data-id="${esc(n.id)}" style="--nc:${colorHex(n.color)}" tabindex="0" aria-label="${esc(title)}">
      <header class="nc-head"><h3>${esc(title)}</h3>${n.pinned && !inTrash ? `<span class="nc-pin" title="Sabitlendi">${ICONS.pin}</span>` : ""}</header>
      ${html ? `<div class="nc-body md">${html}</div>` : `<p class="nc-empty">Boş not</p>`}
      ${truncated ? `<div class="nc-more">devamı…</div>` : ""}
      ${cl.total ? `<div class="nc-progress"><div class="bar"><i style="width:${Math.round((cl.done / cl.total) * 100)}%"></i></div><span>${cl.done}/${cl.total}</span></div>` : ""}
      <footer class="nc-foot">
        <div class="nc-tags">${tags.slice(0, 3).map((t) => `<span class="md-tag" data-tag="${esc(t)}">#${esc(t)}</span>`).join("")}</div>
        <time>${inTrash ? `${left} gün kaldı` : ago(n.updatedAt)}</time>
      </footer>
      <div class="nc-actions">${actions}</div>
    </article>`;
  }

  function emptyHTML() {
    const [t, p, btn] =
      S.query || S.tag ? ["Eşleşen not yok", "Aramayı veya etiket filtresini değiştirmeyi dene.", false] :
      S.filter === "trash" ? ["Çöp kutusu boş", "Sildiğin notlar 30 gün boyunca burada bekler.", false] :
      S.filter === "archived" ? ["Arşiv boş", "Arşivlediğin notlar burada saklanır.", false] :
      S.filter === "pinned" ? ["Sabitlenmiş not yok", "Önemli notlarını sabitleyerek en üstte tut.", false] :
      ["Henüz not yok", "İlk notunu oluştur ya da bir şablonla başla.", true];
    return `<div class="empty notes-empty"><div class="empty-icon">${ICONS.note}</div><strong>${t}</strong><p>${p}</p>${btn ? `<button type="button" class="btn-primary btn-sm" data-new-note>${ICONS.plus}<em>Yeni not</em></button>` : ""}</div>`;
  }

  function renderNotes() {
    const list = visibleNotes();
    const wrap = $("#notesGrid");
    wrap.className = `notes-wrap layout-${S.layout}`;
    const pinned = list.filter((n) => n.pinned), others = list.filter((n) => !n.pinned);
    const grid = (arr) => `<div class="notes-grid">${arr.map(cardHTML).join("")}</div>`;
    wrap.innerHTML = !list.length ? emptyHTML()
      : S.filter === "all" && pinned.length && others.length
        ? `<h2 class="notes-sec">${ICONS.pin}Sabitlenenler</h2>${grid(pinned)}<h2 class="notes-sec">${ICONS.note}Diğer notlar</h2>${grid(others)}`
        : grid(list);
    $("#trashHint").hidden = !(S.filter === "trash" && list.length);
    renderChrome();
  }

  function counts() {
    const c = { all: 0, pinned: 0, archived: 0, trash: 0 };
    S.notes.forEach((n) => {
      if (n.deletedAt) c.trash++;
      else if (n.archived) c.archived++;
      else { c.all++; if (n.pinned) c.pinned++; }
    });
    return c;
  }
  function allTags() {
    const m = new Map();
    S.notes.filter(isActive).forEach((n) => tagsOf(n.body).forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"));
  }
  function renderChrome() {
    const c = counts();
    $$("[data-ncount]").forEach((el) => { el.textContent = c[el.dataset.ncount]; });
    $$("[data-nfilter]").forEach((b) => b.classList.toggle("active", b.dataset.nfilter === S.filter));
    const tags = allTags();
    const chip = (t, k) => `<button type="button" class="tag-chip ${S.tag === t ? "active" : ""}" data-tagf="${esc(t)}">#${esc(t)}<b>${k}</b></button>`;
    $("#tagRow").innerHTML = tags.length && S.filter !== "trash"
      ? `<button type="button" class="tag-chip ${S.tag ? "" : "active"}" data-tagf="">Tüm etiketler</button>${tags.map(([t, k]) => chip(t, k)).join("")}`
      : "";
    $("#sideTags").innerHTML = tags.length
      ? tags.slice(0, 10).map(([t, k]) => `<button type="button" class="nav-item ${S.tag === t ? "active" : ""}" data-tagf="${esc(t)}"><span class="hash">#</span>${esc(t)}<b>${k}</b></button>`).join("")
      : `<p class="side-empty">Notlarına #etiket ekle</p>`;
    $$("#layoutToggle button").forEach((b) => b.classList.toggle("active", b.dataset.layout === S.layout));
    updateViewCounts();
    glide($("#noteSeg"));
  }
  function updateViewCounts() {
    const t = $('[data-vcount="tasks"]'), n = $('[data-vcount="notes"]');
    if (t) t.textContent = TF.state.tasks.filter((x) => !x.done).length;
    if (n) n.textContent = counts().all;
  }
  function glide(seg) {
    const a = seg && seg.querySelector("button.active"), g = seg && seg.querySelector(".seg-glider");
    if (!a || !g || !a.offsetWidth) return;
    g.style.width = `${a.offsetWidth}px`;
    g.style.transform = `translateX(${a.offsetLeft - 5}px)`;
  }

  /* ---------- Görünüm geçişi ---------- */
  const VIEWS = { tasks: "#viewTasks", notes: "#viewNotes", calendar: "#viewCalendar", stats: "#viewStats" };
  const TITLES = { tasks: "Taskflow — Görevler ve Notlar", notes: "Notlar — Taskflow", calendar: "Takvim — Taskflow", stats: "Verimlilik — Taskflow" };
  function setView(v, { persist = true, initial = false } = {}) {
    S.view = VIEWS[v] ? v : "tasks";
    Object.entries(VIEWS).forEach(([k, sel]) => { const el = $(sel); if (el) el.hidden = k !== S.view; });
    $$(".nav-group[data-for]").forEach((g) => { g.hidden = g.dataset.for !== S.view; });
    $$("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === S.view));
    if (persist) store.set(VIEW_KEY, S.view);
    document.title = TITLES[S.view];
    if (S.view === "notes") renderNotes();
    else if (S.view === "tasks" && !initial) TF.render(); // ilk açılışta görevler zaten çizildi
    if (!initial) window.scrollTo(0, 0);
    updateViewCounts();
    document.dispatchEvent(new CustomEvent("taskflow:view", { detail: S.view }));
  }

  /* ---------- Not işlemleri ---------- */
  function createNote({ title = "", body = "", color = "none" } = {}) {
    const now = Date.now();
    const n = { id: uid(), title, body, color, pinned: false, archived: false, deletedAt: null, createdAt: now, updatedAt: now };
    S.notes.unshift(n);
    saveNotes();
    if (S.filter !== "all" && S.filter !== "pinned") S.filter = "all";
    S.tag = null;
    if (S.view !== "notes") setView("notes"); else renderNotes();
    openEditor(n.id, { mode: "edit", focus: title ? "text" : "title" });
    return n;
  }

  function noteAction(n, act) {
    if (act === "pin") {
      n.pinned = !n.pinned; saveNotes();
      toast(n.pinned ? "Not sabitlendi" : "Sabitleme kaldırıldı", { icon: "pin" });
    } else if (act === "archive") {
      const wasPinned = n.pinned;
      n.archived = !n.archived; if (n.archived) n.pinned = false; saveNotes();
      toast(n.archived ? "Not arşivlendi" : "Not arşivden çıkarıldı", {
        icon: "archive",
        action: { label: "Geri al", run: () => { n.archived = !n.archived; n.pinned = wasPinned; saveNotes(); renderNotes(); } },
      });
    } else if (act === "trash") {
      n.deletedAt = Date.now(); saveNotes();
      toast("Not çöp kutusuna taşındı", {
        icon: "trash",
        action: { label: "Geri al", run: () => { n.deletedAt = null; saveNotes(); renderNotes(); } },
      });
    } else if (act === "restore") {
      n.deletedAt = null; saveNotes();
      toast("Not geri yüklendi", { icon: "undo" });
    } else if (act === "destroy") {
      confirmDialog({
        title: "Not kalıcı olarak silinsin mi?",
        text: `“${n.title || "Başlıksız not"}” kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
        ok: "Kalıcı olarak sil",
      }).then((ok) => {
        if (!ok) return;
        S.notes = S.notes.filter((x) => x !== n); saveNotes(); renderNotes();
        toast("Not kalıcı olarak silindi", { icon: "trash" });
      });
      return;
    }
    renderNotes();
  }

  function confirmDialog({ title, text, ok = "Sil", danger = true }) {
    return new Promise((resolve) => {
      const box = $("#confirm"), okBtn = $("#cfOk");
      $("#cfTitle").textContent = title; $("#cfText").textContent = text;
      okBtn.textContent = ok; okBtn.classList.toggle("safe", !danger);
      box.hidden = false; $("#cfCancel").focus();
      const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
      const done = (v) => { box.hidden = true; box.onclick = null; document.removeEventListener("keydown", onKey, true); resolve(v); };
      document.addEventListener("keydown", onKey, true);
      box.onclick = (e) => {
        if (e.target === box || e.target.closest("#cfCancel")) done(false);
        else if (e.target.closest("#cfOk")) done(true);
      };
    });
  }

  /* ---------- Düzenleyici ---------- */
  const ed = {
    box: $("#editor"), panel: $("#editor .editor"), title: $("#edTitle"), text: $("#edText"),
    preview: $("#edPreview"), saved: $("#edSaved"), meta: $("#edMeta"),
  };
  let saveTimer = null, lastFocus = null;
  const setInert = (on) => { $$(".app, .tabbar").forEach((el) => { el.inert = on; }); };

  function openEditor(id, { mode, focus } = {}) {
    const n = byId(id);
    if (!n) return;
    lastFocus = document.activeElement;
    S.editing = id;
    ed.title.value = n.title;
    ed.text.value = n.body;
    ed.box.hidden = false;
    document.body.classList.add("modal-open");
    setInert(true);
    paintEditor(n);
    setMode(mode || (n.body.trim() ? "preview" : "edit"), { focus: false });
    ed.saved.classList.remove("saving"); ed.saved.textContent = "Kaydedildi";
    requestAnimationFrame(() => {
      if (focus === "title") ed.title.focus();
      else if (S.mode === "edit") { ed.text.focus(); ed.text.setSelectionRange(ed.text.value.length, ed.text.value.length); }
      else ed.panel.focus();
    });
  }

  function paintEditor(n) {
    ed.panel.style.setProperty("--nc", colorHex(n.color));
    $("#edColors").innerHTML = COLORS.map((c) =>
      `<button type="button" class="ed-color ${n.color === c.id ? "active" : ""}" data-color="${c.id}" style="--c:${c.hex}" title="${c.label}" aria-label="Renk: ${c.label}" aria-pressed="${n.color === c.id}"></button>`).join("");
    const pin = $("#edPin"), arc = $("#edArchive");
    pin.classList.toggle("on", n.pinned); pin.title = n.pinned ? "Sabitlemeyi kaldır" : "Sabitle"; pin.setAttribute("aria-pressed", n.pinned);
    arc.classList.toggle("on", n.archived); arc.title = n.archived ? "Arşivden çıkar" : "Arşivle";
    updateMeta(n);
  }

  function updateMeta(n) {
    const words = (n.body.match(/[\p{L}\p{N}]+/gu) || []).length;
    const cl = checklist(n.body);
    ed.meta.textContent = `${words} kelime · ${n.body.length} karakter${cl.total ? ` · ${cl.done}/${cl.total} yapıldı` : ""} · Düzenlendi: ${fmtDate(n.updatedAt)} ${fmtTime(n.updatedAt)}`;
  }

  function setMode(m, { focus = true } = {}) {
    S.mode = m;
    const n = byId(S.editing);
    ed.text.hidden = m !== "edit";
    ed.preview.hidden = m !== "preview";
    $$("#edToolbar [data-mode]").forEach((b) => { const on = b.dataset.mode === m; b.classList.toggle("active", on); b.setAttribute("aria-selected", on); });
    $$("#edToolbar [data-fmt]").forEach((b) => { b.disabled = m !== "edit"; });
    if (m === "preview" && n) {
      const r = renderMd(n.body);
      ed.preview.innerHTML = r.html || `<p class="nc-empty">Bu not boş. Yazmaya başlamak için “Yaz” sekmesine geç.</p>`;
    }
    if (m === "edit" && focus) ed.text.focus();
  }

  function scheduleSave() {
    ed.saved.classList.add("saving"); ed.saved.textContent = "Kaydediliyor…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 350);
  }
  function flushSave() {
    clearTimeout(saveTimer); saveTimer = null;
    const n = byId(S.editing);
    if (!n) return;
    if (n.title !== ed.title.value || n.body !== ed.text.value) {
      n.title = ed.title.value; n.body = ed.text.value;
      touch(n); renderNotes(); updateMeta(n);
    }
    ed.saved.classList.remove("saving"); ed.saved.textContent = "Kaydedildi";
  }
  function closeEditor() {
    if (!S.editing) return;
    flushSave();
    const n = byId(S.editing);
    S.editing = null;
    ed.box.hidden = true;
    document.body.classList.remove("modal-open");
    setInert(false);
    if (n && !n.title.trim() && !n.body.trim()) { S.notes = S.notes.filter((x) => x !== n); saveNotes(); } // boş notları bırakma
    renderNotes();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* Biçimlendirme — execCommand("insertText") geri al (Ctrl+Z) geçmişini korur */
  function replaceRange(start, end, text, selStart, selEnd) {
    const ta = ed.text;
    ta.focus(); ta.setSelectionRange(start, end);
    const okCmd = text === "" ? (start === end || document.execCommand("delete")) : document.execCommand("insertText", false, text);
    if (!okCmd) ta.setRangeText(text, start, end, "end");
    if (selStart != null) ta.setSelectionRange(selStart, selEnd ?? selStart);
    scheduleSave();
  }
  function wrapSel(before, after = before, placeholder = "metin") {
    const ta = ed.text, s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || placeholder;
    replaceRange(s, e, before + sel + after, s + before.length, s + before.length + sel.length);
  }
  function prefixLines(prefix, numbered = false) {
    const ta = ed.text, v = ta.value;
    const s = v.lastIndexOf("\n", ta.selectionStart - 1) + 1;
    let e = v.indexOf("\n", ta.selectionEnd); if (e === -1) e = v.length;
    const lines = v.slice(s, e).split("\n");
    const strip = (l) => l.replace(/^(\s*)([-*] \[[ xX]\] |[-*] |\d+[.)] |> |#{1,3} )/, "$1");
    const has = lines.every((l) => (numbered ? /^\s*\d+[.)] /.test(l) : l.startsWith(prefix)));
    const out = lines.map((l, i) => (has ? strip(l) : (numbered ? `${i + 1}. ` : prefix) + strip(l))).join("\n");
    if (lines.length === 1) replaceRange(s, e, out, s + out.length);
    else replaceRange(s, e, out, s, s + out.length);
  }
  const FMT = {
    bold: () => wrapSel("**"),
    italic: () => wrapSel("*"),
    strike: () => wrapSel("~~"),
    code: () => wrapSel("`", "`", "kod"),
    link: () => {
      const ta = ed.text, s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || "bağlantı";
      const t = `[${sel}](https://)`;
      replaceRange(s, e, t, s + sel.length + 3, s + t.length - 1);
    },
    h2: () => prefixLines("## "),
    ul: () => prefixLines("- "),
    ol: () => prefixLines("", true),
    check: () => prefixLines("- [ ] "),
    quote: () => prefixLines("> "),
  };

  ed.title.addEventListener("input", scheduleSave);
  ed.text.addEventListener("input", scheduleSave);
  ed.title.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); setMode("edit"); }
  });
  ed.text.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); FMT.bold(); return; }
    if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); FMT.italic(); return; }
    if (e.key !== "Enter" || e.shiftKey || mod || e.isComposing) return;
    // Liste devamı: Enter yeni madde açar, boş maddede Enter listeyi bitirir
    const ta = ed.text, v = ta.value, pos = ta.selectionStart;
    if (pos !== ta.selectionEnd) return;
    const ls = v.lastIndexOf("\n", pos - 1) + 1, line = v.slice(ls, pos);
    const m = line.match(/^(\s*)([-*] \[[ xX]\] |[-*] |(\d+)([.)]) |> )/);
    if (!m) return;
    e.preventDefault();
    if (line.trim() === m[2].trim()) { replaceRange(ls, pos, "", ls); return; }
    const next = m[3] ? `${+m[3] + 1}${m[4]} ` : m[2].replace(/\[[xX]\]/, "[ ]");
    replaceRange(pos, pos, `\n${m[1]}${next}`, pos + 1 + m[1].length + next.length);
  });

  $("#edToolbar").addEventListener("click", (e) => {
    const f = e.target.closest("[data-fmt]");
    if (f) { if (!f.disabled) FMT[f.dataset.fmt](); return; }
    const m = e.target.closest("[data-mode]");
    if (m) { flushSave(); setMode(m.dataset.mode); }
  });
  ed.preview.addEventListener("click", (e) => {
    const box = e.target.closest(".md-box[data-line]");
    if (box) {
      flushSave();
      const n = byId(S.editing);
      toggleLine(n, +box.dataset.line);
      ed.text.value = n.body;
      setMode("preview"); updateMeta(n); renderNotes();
      return;
    }
    const tag = e.target.closest(".md-tag");
    if (tag) { closeEditor(); filterTag(tag.dataset.tag); }
  });
  ed.preview.addEventListener("dblclick", (e) => { if (!e.target.closest("a, .md-box, .md-tag")) setMode("edit"); });

  $("#edColors").addEventListener("click", (e) => {
    const b = e.target.closest("[data-color]");
    if (!b) return;
    const n = byId(S.editing);
    n.color = b.dataset.color; touch(n); paintEditor(n); renderNotes();
  });
  $("#edPin").addEventListener("click", () => {
    const n = byId(S.editing);
    n.pinned = !n.pinned; saveNotes(); paintEditor(n); renderNotes();
    toast(n.pinned ? "Not sabitlendi" : "Sabitleme kaldırıldı", { icon: "pin" });
  });
  $("#edArchive").addEventListener("click", () => {
    const id = S.editing; closeEditor();
    const n = byId(id); if (n) noteAction(n, "archive");
  });
  $("#edDelete").addEventListener("click", () => {
    const id = S.editing; closeEditor();
    const n = byId(id); if (n) noteAction(n, "trash");
  });
  $("#edExport").addEventListener("click", () => {
    flushSave();
    const n = byId(S.editing);
    const md = `${n.title ? `# ${n.title}\n\n` : ""}${n.body}\n`;
    if (EMBED) { copyOut(md, "Not (Markdown)"); return; }
    download(`${slug(n.title) || "not"}.md`, md, "text/markdown");
    toast("Not .md dosyası olarak indirildi", { icon: "download" });
  });
  $("#edClose").addEventListener("click", closeEditor);
  ed.box.addEventListener("mousedown", (e) => { if (e.target === ed.box) closeEditor(); });

  $("#edToTasks").addEventListener("click", () => {
    flushSave();
    const n = byId(S.editing);
    const items = n.body.split("\n")
      .map((l) => l.match(CHECK_RE))
      .filter((m) => m && m[2] === " ")
      .map((m) => m[4].replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, "").replace(/[*~`]/g, "").trim())
      .filter(Boolean);
    if (!items.length) { toast("Bu notta açık yapılacak madde yok", { icon: "checkCircle" }); return; }
    const existing = new Set(TF.state.tasks.filter((t) => t.noteId === n.id).map((t) => t.title));
    const fresh = [...new Set(items)].filter((t) => !existing.has(t));
    if (!fresh.length) { toast("Bu maddeler zaten görev listende", { icon: "checkCircle" }); return; }
    TF.addTasks(fresh.map((title) => ({ title, noteId: n.id, category: "Notlar", priority: "medium" })));
    toast(`${fresh.length} görev eklendi`, {
      icon: "send",
      action: { label: "Görevlere git", icon: "send", run: () => { closeEditor(); setView("tasks"); } },
    });
  });

  /* ---------- Not ekranı olayları ---------- */
  function filterTag(t) {
    const v = tagKey(t || "");
    S.tag = v && S.tag !== v ? v : null;
    if (S.filter === "trash") S.filter = "all";
    if (S.view !== "notes") setView("notes"); else renderNotes();
  }

  $("#notesGrid").addEventListener("click", (e) => {
    if (e.target.closest("[data-new-note]")) { createNote(); return; }
    const card = e.target.closest(".note-card");
    if (!card) return;
    const n = byId(card.dataset.id);
    if (!n) return;
    const act = e.target.closest("[data-nact]");
    if (act) { noteAction(n, act.dataset.nact); return; }
    const box = e.target.closest(".md-box[data-line]");
    if (box) { toggleLine(n, +box.dataset.line, false); renderNotes(); return; }
    const tag = e.target.closest(".md-tag");
    if (tag) { filterTag(tag.dataset.tag); return; }
    if (e.target.closest("a")) return;
    if (n.deletedAt) { toast("Düzenlemek için önce notu geri yükle", { icon: "trash" }); return; }
    openEditor(n.id);
  });
  $("#notesGrid").addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("note-card")) { e.preventDefault(); e.target.click(); }
  });

  document.addEventListener("click", (e) => {
    const v = e.target.closest("[data-view]");
    if (v) { setView(v.dataset.view); return; }
    const f = e.target.closest("[data-nfilter]");
    if (f) {
      S.filter = f.dataset.nfilter;
      if (S.filter === "trash") S.tag = null;
      if (S.view !== "notes") setView("notes"); else renderNotes();
      return;
    }
    const t = e.target.closest("[data-tagf]");
    if (t) { if (t.dataset.tagf) filterTag(t.dataset.tagf); else { S.tag = null; renderNotes(); } return; }
    const o = e.target.closest("[data-open-note]");
    if (o) {
      const n = byId(o.dataset.openNote);
      if (n && !n.deletedAt) { if (n.archived) S.filter = "archived"; setView("notes"); openEditor(n.id); }
      else toast("Bağlı not bulunamadı (silinmiş olabilir)", { icon: "note" });
    }
  });

  $("#noteSearch").addEventListener("input", (e) => { S.query = e.target.value.trim(); renderNotes(); });
  $("#noteSort").addEventListener("change", (e) => { S.sort = e.target.value; renderNotes(); });
  $("#layoutToggle").addEventListener("click", (e) => {
    const b = e.target.closest("[data-layout]");
    if (!b) return;
    S.layout = b.dataset.layout; store.set(LAYOUT_KEY, S.layout); renderNotes();
  });
  $("#newNoteBtn").addEventListener("click", () => createNote());
  $("#emptyTrash").addEventListener("click", async () => {
    const k = S.notes.filter((n) => n.deletedAt).length;
    if (!k) return;
    const ok = await confirmDialog({ title: "Çöp kutusu boşaltılsın mı?", text: `${k} not kalıcı olarak silinecek. Bu işlem geri alınamaz.`, ok: "Çöpü boşalt" });
    if (!ok) return;
    S.notes = S.notes.filter((n) => !n.deletedAt); saveNotes(); renderNotes();
    toast("Çöp kutusu boşaltıldı", { icon: "trash" });
  });

  /* Şablonlar */
  const tplMenu = $("#tplMenu"), tplBtn = $("#tplBtn");
  tplMenu.innerHTML = TEMPLATES.map((t) =>
    `<button type="button" role="menuitem" data-tpl="${t.id}"><span class="tpl-dot" style="--c:${colorHex(t.color)}"></span><span><strong>${t.name}</strong><small>${t.desc}</small></span></button>`).join("");
  const showTpl = (on) => { tplMenu.hidden = !on; tplBtn.setAttribute("aria-expanded", on); };
  tplBtn.addEventListener("click", (e) => { e.stopPropagation(); showTpl(tplMenu.hidden); });
  tplMenu.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tpl]");
    if (!b) return;
    const t = TEMPLATES.find((x) => x.id === b.dataset.tpl);
    showTpl(false);
    createNote({ title: t.title(), body: t.body, color: t.color });
  });
  document.addEventListener("click", (e) => { if (!tplMenu.hidden && !e.target.closest(".tpl-wrap")) showTpl(false); });

  /* Yedekleme */
  $("#backupBtn").addEventListener("click", () => {
    const data = { app: "taskflow", version: 1, exportedAt: new Date().toISOString(), tasks: TF.state.tasks, notes: S.notes };
    if (EMBED) { copyOut(JSON.stringify(data), "Yedek"); return; }
    download(`taskflow-yedek-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
    toast("Yedek dosyası indirildi", { icon: "download" });
  });
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    let data;
    try { data = JSON.parse(await file.text()); } catch (_) { toast("Dosya okunamadı: geçerli bir JSON değil", { icon: "x" }); return; }
    if (!data || data.app !== "taskflow" || !Array.isArray(data.tasks) || !Array.isArray(data.notes)) {
      toast("Bu dosya bir Taskflow yedeği değil", { icon: "x" }); return;
    }
    const ok = await confirmDialog({
      title: "Yedek geri yüklensin mi?",
      text: `${data.tasks.length} görev ve ${data.notes.length} not yüklenecek. Mevcut görev ve notlarının yerini alacak.`,
      ok: "Geri yükle", danger: false,
    });
    if (!ok) return;
    const now = Date.now();
    TF.state.tasks = data.tasks.filter((t) => t && t.id && typeof t.title === "string").map((t) => ({
      category: "Genel", due: null, done: false, createdAt: now, completedAt: null, ...t,
      priority: ["high", "medium", "low"].includes(t.priority) ? t.priority : "medium",
    }));
    S.notes = data.notes.filter((n) => n && n.id && typeof n.body === "string").map((n) => ({
      title: "", color: "none", pinned: false, archived: false, deletedAt: null, createdAt: now, updatedAt: now, ...n,
    }));
    TF.save(); saveNotes(); TF.render(); renderNotes();
    toast("Yedek geri yüklendi", { icon: "check" });
  });

  /* Klavye kısayolları */
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (e.key === "Escape") {
      if (!$("#confirm").hidden) return;
      if (!tplMenu.hidden) { showTpl(false); return; }
      if (S.editing) { e.preventDefault(); closeEditor(); }
      return;
    }
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (!S.editing) (S.view === "notes" ? $("#noteSearch") : $("#searchInput")).focus();
      return;
    }
    if (e.altKey && !mod && e.code === "KeyN") { e.preventDefault(); if (!S.editing) createNote(); return; }
    if (mod && e.key.toLowerCase() === "s" && S.editing) { e.preventDefault(); flushSave(); }
  });

  /* ---------- Başlat ---------- */
  document.addEventListener("taskflow:tasks", updateViewCounts);
  window.addEventListener("resize", () => glide($("#noteSeg")));
  if (document.fonts) document.fonts.ready.then(() => glide($("#noteSeg")));

  setView(params.get("view") || store.get(VIEW_KEY) || "tasks", { persist: false, initial: true });
  if (params.has("new")) createNote();
  const open = params.get("open");
  if (open) {
    const target = open === "first" ? visibleNotes()[0] : S.notes.find((n) => norm(n.title).includes(norm(open)));
    if (target) { if (S.view !== "notes") setView("notes", { persist: false }); openEditor(target.id, { mode: params.get("mode") || undefined }); }
  }

  TF.notes = { S, createNote, openEditor, closeEditor, setView, renderMd, tagsOf };
  TF.confirmDialog = confirmDialog;
})();

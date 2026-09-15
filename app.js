// ===== 状态 =====
const filters = { size: "all", age: "all", tag: "all", q: "" };
const FAV_KEY = "pawhome_favs";
const LANG_KEY = "pawhome_lang";
let favs = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
let lang = localStorage.getItem(LANG_KEY) || "zh";
let currentDog = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const t = (key) => T[lang][key];
const IMG_FALLBACK = `onerror="this.classList.add('img-fallback');this.removeAttribute('src');"`;

// ===== 公共框架（导航 / 页脚 / 弹窗）注入 =====
function navHtml(page) {
  const items = [
    ["dogs", "dogs.html", "nav_dogs"],
    ["stories", "stories.html", "nav_stories"],
    ["foster", "foster.html", "nav_foster"],
    ["adopt", "adopt.html", "nav_how"],
    ["donate", "donate.html", "nav_donate"],
  ];
  const links = items.map(([p, href, key]) =>
    `<a href="${href}" class="${p === "donate" ? "nav-donate" : ""}${p === page ? " active" : ""}" data-t="${key}"></a>`).join("");
  return `<header class="nav">
    <a class="brand" href="index.html"><img class="brand-logo" src="assets/art/home.svg" width="39" height="39" alt="" aria-hidden="true" /><span class="brand-name" data-t="brand"></span></a>
    <button class="nav-toggle" id="navToggle" aria-label="Menu / 菜单" aria-expanded="false" aria-controls="navLinks">☰</button>
    <nav class="nav-links" id="navLinks">${links}
      <button id="langBtn" class="lang-pill" title="切换语言 / Switch language" aria-label="切换语言 / Switch language">🌐 <span data-t="langBtn"></span></button>
      <button id="favBtn" class="fav-pill" data-t-title="fav_title" aria-label="${t("fav_title")}">❤️ <span id="favCount">0</span></button>
    </nav>
  </header>`;
}
function footerHtml() {
  return `<footer class="footer">
    <p data-t="footer_main"></p>
    <p class="footer-soft" data-t="footer_soft"></p>
    <p class="footer-org" data-t-html="footer_org"></p>
  </footer>
  <a href="donate.html" class="donate-float" data-t="donate_float"></a>`;
}
function modalsHtml() {
  return `
  <div class="modal" id="modal" hidden><div class="modal-backdrop" data-close></div>
    <div class="modal-card" role="dialog" aria-modal="true"><button class="modal-close" data-close aria-label="关闭">×</button>
      <div class="modal-dog"><img id="modalImg" src="" alt="" /><div><h3 id="modalName"></h3><p id="modalMeta" class="modal-meta"></p></div></div>
      <div class="adopt-links">
        <p class="adopt-lead" data-t="m_lead"></p>
        <a class="btn btn-primary btn-block" href="${FORM_LINKS.cn}" target="_blank" rel="noopener" data-t="m_form_cn"></a>
        <a class="btn btn-ghost btn-block" href="${FORM_LINKS.intl}" target="_blank" rel="noopener" data-t="m_form_intl"></a>
        <p class="adopt-note" data-t="m_note"></p>
      </div>
    </div></div>
  <div class="drawer" id="drawer" hidden><div class="modal-backdrop" data-close-drawer></div>
    <aside class="drawer-card"><div class="drawer-head"><h3 data-t="drawer_title"></h3><button class="modal-close" data-close-drawer aria-label="关闭">×</button></div><div id="favList" class="fav-list"></div></aside></div>
  <div class="modal detail-modal" id="detailModal" hidden><div class="modal-backdrop" data-close-detail></div>
    <div class="modal-card detail-card" role="dialog" aria-modal="true"><button class="modal-close" data-close-detail aria-label="关闭">×</button><div id="detailBody"></div></div></div>
  <div class="modal step-modal" id="stepModal" hidden><div class="modal-backdrop" data-close-step></div>
    <div class="modal-card step-modal-card" role="dialog" aria-modal="true"><button class="modal-close" data-close-step aria-label="关闭">×</button><div id="stepModalBody"></div></div></div>
  <div class="modal story-modal" id="storyModal" hidden><div class="modal-backdrop" data-close-story></div>
    <div class="modal-card story-modal-card" role="dialog" aria-modal="true"><button class="modal-close" data-close-story aria-label="关闭">×</button><div id="storyModalBody"></div></div></div>
  <div class="modal share-modal" id="shareModal" hidden><div class="modal-backdrop" data-close-share></div>
    <div class="modal-card share-card" role="dialog" aria-modal="true"><button class="modal-close" data-close-share aria-label="关闭">×</button>
      <h3 class="share-heading" data-t="share_title"></h3><p class="share-subheading" data-t="share_sub"></p>
      <div id="sharePoster" class="share-poster"></div><textarea id="shareText" class="share-textarea" readonly rows="4"></textarea>
      <div class="share-actions"><button id="shareCopyBtn" class="btn btn-primary" data-t="share_copy"></button><button id="shareNativeBtn" class="btn btn-ghost" data-t="share_native"></button></div>
    </div></div>`;
}
function injectChrome(page) {
  document.body.insertAdjacentHTML("afterbegin", navHtml(page));
  document.body.insertAdjacentHTML("beforeend", footerHtml() + modalsHtml());
}

// ===== i18n =====
function applyStatic() {
  $$("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  $$("[data-t-html]").forEach((el) => { el.innerHTML = t(el.dataset.tHtml); });
  $$("[data-t-ph]").forEach((el) => { el.placeholder = t(el.dataset.tPh); });
  $$("[data-t-title]").forEach((el) => { el.title = t(el.dataset.tTitle); });
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  const _pg = document.body.dataset.page || "home";
  if (T[lang]["title_" + _pg]) document.title = T[lang]["title_" + _pg];
}

// ===== 工具 =====
function sizeLabel(s) { return { small: t("f_small"), medium: t("f_medium"), large: t("f_large") }[s] || s; }
function neuterInfo(dog) {
  const map = {
    done: { key: "neuter_done", cls: "done", icon: "✅" },
    pending: { key: "neuter_pending", cls: "pending", icon: "⏳" },
    no: { key: "neuter_no", cls: "no", icon: "○" },
    unknown: { key: "neuter_unknown", cls: "unknown", icon: "❔" },
  };
  return map[dog.neuter] || map.unknown;
}

// ===== 狗狗墙 =====
function matches(dog) {
  if (filters.size !== "all" && dog.size !== filters.size) return false;
  if (filters.age !== "all" && dog.age !== filters.age) return false;
  const L = dog[lang];
  if (filters.tag !== "all" && !L.tags.includes(filters.tag)) return false;
  if (filters.q) {
    const hay = [L.name, L.breed, L.story, L.more || "", ...L.tags].join(" ").toLowerCase();
    if (!hay.includes(filters.q.toLowerCase())) return false;
  }
  return true;
}
function dogCard(dog) {
  const L = dog[lang];
  const faved = favs.includes(dog.id);
  const tagHtml = L.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  return `
    <article class="card" data-id="${dog.id}">
      <div class="card-img">
        <img src="${dog.img}" alt="${L.name}" loading="lazy" ${dog.imgPos ? `style="object-position:${dog.imgPos}"` : ""} ${IMG_FALLBACK} />
        <button class="heart ${faved ? "on" : ""}" data-fav="${dog.id}" aria-label="fav">❤</button>
        <span class="card-gender">${L.gender}</span>
      </div>
      <div class="card-body" data-open="${dog.id}">
        <div class="card-top"><h3>${L.name}</h3><span class="card-breed">${L.breed}</span></div>
        <div class="card-meta">
          <span>${t("card_birth")} ${L.ageText}</span>
          <span>${t("card_size")} ${sizeLabel(dog.size)}</span>
          <span class="neuter-badge ${neuterInfo(dog).cls}">✂️ ${t(neuterInfo(dog).key)}</span>
        </div>
        <p class="card-story">${L.story}</p>
        <div class="card-tags">${tagHtml}</div>
        <div class="card-actions">
          <button class="btn btn-primary btn-block" data-adopt="${dog.id}">${t("card_adopt")} ${L.name} 🐾</button>
          <button class="card-detail-link" data-open="${dog.id}">${t("detail_more")} →</button>
        </div>
      </div>
    </article>`;
}
function renderDogs() {
  if (!$("#dogGrid")) return;
  const list = DOGS.filter(matches);
  $("#dogGrid").innerHTML = list.map(dogCard).join("");
  $("#emptyState").hidden = list.length > 0;
  if ($("#statTotal")) $("#statTotal").textContent = DOGS.length;
  updateResultCount(list.length);
  updateFavUI();
}
function allTags() {
  const set = new Set();
  const TAG_WL = lang === "zh"
    ? ["亲人","温柔","活泼","安静","聪明","慢热","粘人","乖巧","高能量","吃货","勇敢","淡定"]
    : ["Friendly","Gentle","Playful","Calm","Smart","Slow to warm","Clingy","Sweet","Energetic","Foodie","Brave","Chill"];
  DOGS.forEach((d) => d[lang].tags.forEach((tag) => { if (TAG_WL.includes(tag)) set.add(tag); }));
  return [...set];
}
function renderTagFilter() {
  if (!$("#tagFilter")) return;
  const chips = [`<button class="tag-chip ${filters.tag === "all" ? "active" : ""}" data-tag="all">${t("f_tag_all")}</button>`]
    .concat(allTags().map((tg) => `<button class="tag-chip ${filters.tag === tg ? "active" : ""}" data-tag="${tg}">${tg}</button>`));
  $("#tagFilter").innerHTML = chips.join("");
}
function filtersActive() { return filters.size !== "all" || filters.age !== "all" || filters.tag !== "all" || !!filters.q; }
function updateResultCount(n) {
  if (!$("#resultCount")) return;
  $("#resultCount").textContent = filtersActive() ? `${n} ${t("result_count")}` : "";
  $("#clearFilters").hidden = !filtersActive();
}
function syncFilterChips() {
  $$("#filters .filter-group").forEach((g) => {
    const f = g.dataset.filter;
    g.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.value === filters[f]));
  });
}
function clearFilters() {
  filters.size = "all"; filters.age = "all"; filters.tag = "all"; filters.q = "";
  if ($("#searchInput")) $("#searchInput").value = "";
  syncFilterChips(); renderTagFilter(); renderDogs();
}
function bindDogs() {
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    const group = chip.closest(".filter-group");
    group.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    filters[group.dataset.filter] = chip.dataset.value;
    renderDogs();
  });
  $("#searchInput").addEventListener("input", (e) => { filters.q = e.target.value.trim(); renderDogs(); });
  $("#searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
      const grid = document.querySelector("#dogGrid, .grid, main");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  $("#clearFilters").addEventListener("click", clearFilters);
  $("#tagFilter").addEventListener("click", (e) => {
    const chip = e.target.closest(".tag-chip"); if (!chip) return;
    const tg = chip.dataset.tag;
    filters.tag = (filters.tag === tg) ? "all" : tg;
    renderTagFilter(); renderDogs();
  });
  $("#dogGrid").addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav]"); if (favBtn) return toggleFav(favBtn.dataset.fav);
    const adoptBtn = e.target.closest("[data-adopt]"); if (adoptBtn) return openModal(adoptBtn.dataset.adopt);
    const openBtn = e.target.closest("[data-open]"); if (openBtn) return openDetail(openBtn.dataset.open);
  });
}

// ===== 收藏 =====
function toggleFav(id) {
  const i = favs.indexOf(id);
  if (i >= 0) favs.splice(i, 1); else favs.push(id);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  renderDogs();
}
function updateFavUI() {
  if ($("#favCount")) $("#favCount").textContent = favs.length;
  $$("[data-fav]").forEach((b) => b.classList.toggle("on", favs.includes(b.dataset.fav)));
}
function renderFavList() {
  const list = DOGS.filter((d) => favs.includes(d.id));
  const box = $("#favList");
  if (!list.length) { box.innerHTML = `<p class="empty">${t("fav_empty")}</p>`; return; }
  box.innerHTML = list.map((d) => {
    const L = d[lang];
    return `<div class="fav-item"><img src="${d.img}" alt="${L.name}" ${IMG_FALLBACK} />
      <div class="fav-info"><strong>${L.name}</strong><span>${L.breed} · ${L.ageText}</span></div>
      <a class="btn btn-mini" href="dogs.html">${t("fav_adopt")}</a>
      <button class="fav-remove" data-fav="${d.id}" aria-label="remove">×</button></div>`;
  }).join("");
  box.querySelectorAll("[data-fav]").forEach((b) =>
    b.addEventListener("click", () => { toggleFav(b.dataset.fav); renderFavList(); }));
}

// ===== 领养要求 / 步骤 =====
function renderReq() {
  if (!$("#reqList")) return;
  $("#reqList").innerHTML = t("req_list").map((item) => `<li>${item}</li>`).join("");
  $("#reqContact").textContent = t("req_contact");
}
function renderSteps() {
  if (!$("#steps")) return;
  $("#steps").innerHTML = t("steps").map((s, i) => {
    let extra = "", cls = "";
    if (s.detail) { cls = "step-clickable"; extra = `<button class="step-cta" data-step="${i}">${s.cta || t("detail_more")} →</button>`; }
    else if (s.links) { extra = `<div class="step-links">` + s.links.map((lk) => `<a class="step-cta-link" href="${lk.href}" target="_blank" rel="noopener">${lk.label}</a>`).join("") + `</div>`; }
    else if (s.link) { extra = s.link.href ? `<a class="step-cta-link" href="${s.link.href}" target="_blank" rel="noopener">${s.link.label}</a>` : `<p class="step-pending">${s.link.pending}</p>`; }
    return `<li class="step ${cls}" ${s.detail ? `data-step="${i}"` : ""}><span class="step-no">${i + 1}</span><h3>${s.h}</h3><p>${s.p}</p>${extra}</li>`;
  }).join("");
  $("#steps").addEventListener("click", (e) => {
    const el = e.target.closest("[data-step]"); if (el) openStep(+el.dataset.step);
  });
}
function openStep(i) {
  const s = t("steps")[i]; if (!s || !s.detail) return;
  $("#stepModalBody").innerHTML = `<div class="step-modal-head"><span class="step-no">${i + 1}</span><h2>${s.h}</h2></div><div class="step-modal-detail">${s.detail}</div>`;
  $("#stepModal").hidden = false;
}

// ===== 领养故事 =====
function renderStories() {
  if (!$("#storyGrid")) return;
  const featured = STORIES.filter((s) => s.featured);
  const regular = STORIES.filter((s) => !s.featured);
  if ($("#storyFeatured")) {
    $("#storyFeatured").innerHTML = featured.map((s) => {
      const L = s[lang];
      const place = lang === "zh" ? s.place_zh : s.place_en;
      return `<article class="yiner-card featured-story">
        <div class="yiner-compare">
          <figure><img src="${s.before}" alt="before" ${IMG_FALLBACK} /><figcaption>${t("featured_before")}</figcaption></figure>
          <span class="yiner-arrow">🐾</span>
          <figure><img src="${s.after}" alt="after" ${IMG_FALLBACK} /><figcaption>${t("featured_now")}${place}</figcaption></figure>
        </div>
        <div class="yiner-text"><h3>${L.name} <span class="yiner-place">${place}</span></h3><p class="yiner-lead">${L.text}</p></div>
      </article>`;
    }).join("");
  }
  $("#storyGrid").innerHTML = regular.map((s) => {
    const L = s[lang];
    const place = lang === "zh" ? s.place_zh : s.place_en;
    return `<article class="story-card"><div class="story-img"><img src="${s.img}" alt="${L.name}" loading="lazy" ${IMG_FALLBACK} />
      <span class="story-badge">${t("story_badge")} · ${place}</span></div>
      <div class="story-body"><h3>${L.name}</h3><p>${L.text}</p></div></article>`;
  }).join("");
}

// ===== 中转家庭页 + 银耳 =====
function renderFoster() {
  if ($("#fosterHow")) $("#fosterHow").innerHTML = t("foster_how_list").map((x) => `<li>${x}</li>`).join("");
  if (!$("#yinerStory")) return;
  const y = YINER, L = y[lang];
  $("#yinerStory").innerHTML = `
    <div class="yiner-compare">
      <figure><img src="${y.before}" alt="before" ${IMG_FALLBACK} /><figcaption>${t("yiner_before_cap")}</figcaption></figure>
      <span class="yiner-arrow">🐾</span>
      <figure><img src="${y.after}" alt="after" ${IMG_FALLBACK} /><figcaption>${t("yiner_after_cap")}</figcaption></figure>
    </div>
    <div class="yiner-text">
      <h3>${L.name} <span class="yiner-place">${L.place}</span></h3>
      <p class="yiner-sub">${L.sub}</p>
      <p class="yiner-lead">${L.lead}</p>
      <div class="yiner-actions">
        <button class="btn btn-primary" id="yinerFull">${t("yiner_readmore")} →</button>
      </div>
      <p class="yiner-sign">— ${t("yiner_sign")}</p>
    </div>`;
  $("#yinerFull").addEventListener("click", () => {
    $("#storyModalBody").innerHTML = `<h2 class="story-modal-title">${L.fullTitle}</h2>${L.full}<p class="yiner-sign">— ${t("yiner_sign")}</p>`;
    $("#storyModal").hidden = false;
  });
}

// ===== 首页入口卡片 =====
function renderHome() {
  if ($("#statTotal")) $("#statTotal").textContent = DOGS.length;
  const entryCount = document.querySelector('[data-t="entry_dogs_d"]');
  if (entryCount) entryCount.textContent = t("entry_dogs_d").replace(/^\d+/, String(DOGS.length));
}

// ===== 详情弹窗 =====
function healthRow(dog) {
  const n = neuterInfo(dog);
  const neuterPill = `<span class="health-pill ${n.cls === "done" ? "" : "tbc"}">${n.icon} ${t(n.key)}</span>`;
  return neuterPill + `<p class="health-note">${t("health_base_note")}</p>`;
}
function openDetail(id) {
  const dog = DOGS.find((d) => d.id === id); if (!dog) return;
  currentDog = dog;
  const L = dog[lang];
  const faved = favs.includes(dog.id);
  $("#detailBody").innerHTML = `
    <div class="detail-hero"><img src="${dog.img}" alt="${L.name}" ${dog.imgPos ? `style="object-position:${dog.imgPos}"` : ""} ${IMG_FALLBACK} /><span class="card-gender detail-gender">${L.gender}</span></div>
    <div class="detail-content">
      <div class="detail-head"><h2>${L.name}</h2><span class="card-breed">${L.breed}</span></div>
      <div class="detail-meta"><span>${t("card_birth")} ${L.ageText}</span><span>${t("card_size")} ${sizeLabel(dog.size)}</span></div>
      <h4 class="detail-sub">${t("detail_about")}</h4><p class="detail-text">${L.story}</p>${L.more ? `<p class="detail-text">${L.more}</p>` : ""}
      <h4 class="detail-sub">${t("detail_personality")}</h4><div class="card-tags">${L.tags.map((tg) => `<span class="tag">${tg}</span>`).join("")}</div>
      <h4 class="detail-sub">${t("detail_health")}</h4><div class="health-row">${healthRow(dog)}</div>
      <p class="detail-region">${t("detail_region_note")}</p>
      <div class="detail-actions">
        <button class="btn btn-primary" data-detail-adopt="${dog.id}">${t("detail_adopt")} 🐾</button>
        <button class="btn btn-ghost" data-detail-fav="${dog.id}">${faved ? "❤ " + t("btn_faved") : "🤍 " + t("btn_fav")}</button>
        <button class="btn btn-ghost" data-detail-share="${dog.id}">🔗 ${t("btn_share")}</button>
      </div>
    </div>`;
  $("#detailModal").hidden = false;
}

// ===== 分享 =====
function shareTextFor(dog) {
  const L = dog[lang];
  if (lang === "zh") return `🐾 ${L.name}（${L.breed} · ${L.ageText}）正在等一个家。\n${L.story}\n领养代替购买，转给可能爱它的人 → 回家计划`;
  return `🐾 ${L.name} (${L.breed}, ${L.ageText}) is waiting for a home.\n${L.story}\nAdopt, don't shop — pass it along to someone who might love them. → Bring Them Home`;
}
function openShare(id) {
  const dog = DOGS.find((d) => d.id === id); if (!dog) return;
  const L = dog[lang];
  $("#sharePoster").innerHTML = `<div class="poster-inner"><img src="${dog.img}" alt="${L.name}" ${dog.imgPos ? `style="object-position:${dog.imgPos}"` : ""} ${IMG_FALLBACK} />
    <div class="poster-cap"><strong>${L.name}</strong><span>${L.breed} · ${L.ageText} · ${sizeLabel(dog.size)}</span><em>${t("brand")} 🐾</em></div></div>`;
  $("#shareText").value = shareTextFor(dog);
  $("#shareCopyBtn").textContent = t("share_copy");
  $("#shareModal").hidden = false;
}

// ===== 领养弹窗 =====
function openModal(id) {
  currentDog = DOGS.find((d) => d.id === id); if (!currentDog) return;
  const L = currentDog[lang];
  $("#modalImg").src = currentDog.img; $("#modalImg").alt = L.name;
  $("#modalName").textContent = `${t("modal_title")} ${L.name}`;
  $("#modalMeta").textContent = `${L.breed} · ${L.ageText} · ${sizeLabel(currentDog.size)} · ${L.gender}`;
  $("#modal").hidden = false;
}

// ===== 绑定公共交互 =====
function bindChrome() {
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem(LANG_KEY, lang);
    location.reload();
  });
  const navToggle = $("#navToggle");
  if (navToggle) navToggle.addEventListener("click", () => {
    const open = $("#navLinks").classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  const drawer = $("#drawer");
  $("#favBtn").addEventListener("click", () => { renderFavList(); drawer.hidden = false; });
  drawer.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close-drawer")) drawer.hidden = true; });
  // 领养表单
  $("#modal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) $("#modal").hidden = true; });
  // 详情弹窗交互
  $("#detailModal").addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close-detail")) { $("#detailModal").hidden = true; return; }
    const a = e.target.closest("[data-detail-adopt]"); if (a) { $("#detailModal").hidden = true; return openModal(a.dataset.detailAdopt); }
    const f = e.target.closest("[data-detail-fav]"); if (f) { toggleFav(f.dataset.detailFav); return openDetail(f.dataset.detailFav); }
    const s = e.target.closest("[data-detail-share]"); if (s) return openShare(s.dataset.detailShare);
  });
  // 其它弹窗关闭
  $("#stepModal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close-step")) $("#stepModal").hidden = true; });
  $("#storyModal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close-story")) $("#storyModal").hidden = true; });
  $("#shareModal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close-share")) $("#shareModal").hidden = true; });
  $("#shareCopyBtn").addEventListener("click", async () => {
    const text = $("#shareText").value;
    try { await navigator.clipboard.writeText(text); } catch { $("#shareText").select(); document.execCommand("copy"); }
    $("#shareCopyBtn").textContent = t("share_copied");
    setTimeout(() => { $("#shareCopyBtn").textContent = t("share_copy"); }, 1800);
  });
  if (navigator.share) {
    $("#shareNativeBtn").addEventListener("click", () => { navigator.share({ title: t("brand"), text: $("#shareText").value }).catch(() => {}); });
  } else { $("#shareNativeBtn").hidden = true; }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal, .drawer").forEach((m) => { m.hidden = true; });
  });
}

// ===== 初始化 =====
function init() {
  const page = document.body.dataset.page || "home";
  injectChrome(page);
  applyStatic();
  bindChrome();
  const R = { home: renderHome, dogs: () => { renderTagFilter(); renderDogs(); bindDogs(); }, stories: renderStories, foster: renderFoster, adopt: () => { renderReq(); renderSteps(); }, donate: () => {} };
  (R[page] || (() => {}))();
  updateFavUI();
}
document.addEventListener("DOMContentLoaded", init);

// Tiny helper: query
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

const state = {
  filter: "all",
  theme: localStorage.getItem("theme") || "dark",
  links: {
    github: "#",
    linkedin: "#"
  }
};

function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  state.theme = theme;
}

function formatMoney(n){
  return n.toLocaleString(undefined, {style:"currency", currency:"USD", maximumFractionDigits:0});
}


function countUp(){
  const els = $$(".kpi-num");
  const start = performance.now();

  function tick(now){
    const t = clamp((now - start) / 900, 0, 1);
    for (const el of els){
      const target = +el.dataset.count;
      const val = Math.round(target * (t*t*(3-2*t))); // smoothstep
      el.textContent = val;
    }
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function projectCategory(p){
  // Quick mapping so filters work.
  if (p.id === "shipment") return ["analytics","bi"];
  if (p.id === "customer") return ["analytics","ml"];
  if (p.id === "parking") return ["apps"];
  if (p.id === "alexa") return ["apps"];
  if (p.id === "keylogger") return ["security","analytics"];
  return ["analytics"];
}

function projHealthBadges(p){
  // Little badges to show “business sense”
  const badges = [];
  badges.push({label:"Problem", cls:"good"});
  badges.push({label:"Approach", cls:"warn"});
  badges.push({label:"Outcome", cls:"good"});
  return badges;
}

function renderProjects(){
  const grid = $("#projectGrid");
  grid.innerHTML = "";

  const projects = (window.__PROJECTS__ || []).map(p => ({
    ...p,
    categories: projectCategory(p)
  }));

  const filtered = state.filter === "all"
    ? projects
    : projects.filter(p => p.categories.includes(state.filter));

  for (const p of filtered){
    const card = document.createElement("article");
    card.className = "proj";
    card.tabIndex = 0;
    card.setAttribute("role","button");
    card.setAttribute("aria-label", `Open ${p.title} details`);

    const tags = p.stack.slice(0,4).map(t => `<span>${escapeHtml(t)}</span>`).join("");
    const badges = projHealthBadges(p).map(b => `<span class="kbadge ${b.cls}">${b.label}</span>`).join("");

    card.innerHTML = `
      <div class="proj-top">
        <div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.tagline)}</p>
        </div>
        <span class="badge">${escapeHtml(p.categories[0].toUpperCase())}</span>
      </div>

      <div class="proj-meta">${badges}</div>

      <div class="proj-tags">${tags}</div>
      <p class="muted tiny">Click for the case study.</p>
    `;

    const open = () => openModal(p);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    grid.appendChild(card);
  }

  if (!filtered.length){
    grid.innerHTML = `<div class="muted">No projects in this filter. Humans love sorting things too much.</div>`;
  }
}

function openModal(p){
  const modal = $("#projectModal");
  const body = $("#modalBody");

  const impact = p.impact.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  const highlights = p.highlights.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  const stack = p.stack.map(x => `<li>${escapeHtml(x)}</li>`).join("");

  body.innerHTML = `
    <div class="modal-head">
      <div>
        <h3>${escapeHtml(p.title)}</h3>
        <p class="modal-sub">${escapeHtml(p.tagline)}</p>
      </div>
      <span class="badge">Case study</span>
    </div>

    <div class="cols">
      <div class="box">
        <h4>Problem → Impact</h4>
        <ul>${impact}</ul>
      </div>

      <div class="box">
        <h4>What I built</h4>
        <ul>${highlights}</ul>
      </div>

      <div class="box">
        <h4>Tools</h4>
        <ul>${stack}</ul>
      </div>

      <div class="box">
        <h4>How I'd improve it next</h4>
        <ul>
          <li>Add robust data validation + automated tests.</li>
          <li>Instrument user actions and define a KPI tree.</li>
          <li>Ship an executive summary view (one screen, no scrolling).</li>
        </ul>
      </div>
    </div>

    <div class="modal-links">
      <a class="secondary" href="${p.links.github}" target="_blank" rel="noreferrer">GitHub</a>
      <a class="secondary" href="${p.links.demo}" target="_blank" rel="noreferrer">Demo</a>
      <button class="ghost" id="copyProject">Copy summary</button>
    </div>
  `;

  modal.showModal();

  $("#copyProject").addEventListener("click", async () => {
    const summary = `${p.title} - ${p.tagline}\nImpact: ${p.impact.join(" | ")}\nStack: ${p.stack.join(", ")}`;
    await navigator.clipboard.writeText(summary);
    toast("Copied project summary.");
  });
}

function toast(msg){
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "18px";
  t.style.transform = "translateX(-50%)";
  t.style.padding = "10px 12px";
  t.style.borderRadius = "14px";
  t.style.border = "1px solid rgba(255,255,255,.18)";
  t.style.background = "rgba(0,0,0,.55)";
  t.style.backdropFilter = "blur(12px)";
  t.style.color = "white";
  t.style.fontWeight = "800";
  t.style.zIndex = "999";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function setupFilters(){
  $$(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      renderProjects();
    });
  });
}

function setupNav(){
  const toggle = $("#navToggle");
  const links = $("#navLinks");

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // close menu after click (mobile)
  $$("#navLinks a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
  }));
}

function setupTheme(){
  setTheme(state.theme);
  $("#themeToggle").addEventListener("click", () => {
    setTheme(state.theme === "dark" ? "light" : "dark");
  });
}

function setupContact(){
  $("#copyEmail").addEventListener("click", async () => {
    await navigator.clipboard.writeText("sreyakambhatla@outlook.com");
    toast("Email copied.");
  });

  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name");
    const email = fd.get("email");
    const message = fd.get("message");

    const subject = encodeURIComponent(`Data/Business Analytics - ${name}`);
    const body = encodeURIComponent(`Hi Sreya,\n\n${message}\n\nFrom: ${name} (${email})\n`);
    window.location.href = `mailto:sreyakambhatla@outlook.com?subject=${subject}&body=${body}`;
  });
}

function setupModal(){
  const modal = $("#projectModal");
  $("#modalClose").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inDialog =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inDialog) modal.close();
  });
}

function setupLinks(){
  // Replace these with your real URLs.
  // This keeps the page deployable even if you don't paste links yet.
  const gh = state.links.github;
  const li = state.links.linkedin;

  $("#ghLink").href = gh;
  $("#liLink").href = li;
  $("#contactGithub").href = gh;
}

function setupScrollReveal(){
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const candidates = [
    ...document.querySelectorAll(".section .container > *"),
    ...document.querySelectorAll(".project-card, .timeline-item, .skill-row, .card, .pill")
  ].filter(el => !el.closest("nav") && !el.closest("footer"));

  // Avoid double-observing the same element
  const els = [...new Set(candidates)];

  if(reduce){
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  els.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) e.target.classList.add("is-visible");
      else e.target.classList.remove("is-visible"); // re-appear when scrolling back
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
}

function init(){
  $("#year").textContent = new Date().getFullYear();

  setupTheme();
  setupNav();
  setupFilters();
  setupModal();
  setupContact();
  setupLinks();
  setupScrollReveal();

  // animate counts when hero is visible
  const hero = $(".hero");
  const io = new IntersectionObserver((entries) => {
    if(entries.some(e => e.isIntersecting)){
      countUp();
      io.disconnect();
    }
  }, {threshold: .35});
  io.observe(hero);

  renderProjects();
}

document.addEventListener("DOMContentLoaded", init);

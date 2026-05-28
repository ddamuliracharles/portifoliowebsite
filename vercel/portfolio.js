(function () {
  const grid = document.getElementById("work-grid");
  const statProjects = document.querySelector("[data-stat-projects]");
  const filters = document.querySelectorAll(".work-filter");
  const profile = window.__PROFILE__;
  if (!grid || !profile) return;

  const username = profile.githubUsername || "ddamuliracharles";
  let projects = profile.projects || [];

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text || "";
    return d.innerHTML;
  }

  function kindLabel(kind) {
    return (
      {
        organization: "Organization",
        contribution: "Open Source Contribution",
        private: "Private",
      }[kind] || "Personal"
    );
  }

  function renderCard(project) {
    const tags = (project.tags || [])
      .map((t) => `<li>${escapeHtml(t)}</li>`)
      .join("");
    const link =
      project.url && !project.isPrivate
        ? `<a class="work-card__link" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">View on GitHub</a>`
        : project.isPrivate
          ? `<span class="work-card__link work-card__link--muted">Private repository</span>`
          : "";
    const org = project.organization
      ? `<p class="work-card__org">${escapeHtml(project.organization)}</p>`
      : "";
    const role = project.role
      ? `<p class="work-card__role">${escapeHtml(project.role)}</p>`
      : "";
    const diagram = project.mermaidDiagram
      ? `<details class="work-card__diagram"><summary>Architecture diagram</summary><pre class="mermaid">${escapeHtml(project.mermaidDiagram)}</pre></details>`
      : "";

    return `
      <article class="work-card" data-kind="${escapeHtml(project.kind || "personal")}">
        <div class="work-card__preview">
          <span class="work-card__badge work-card__badge--${escapeHtml(project.kind || "personal")}">${escapeHtml(kindLabel(project.kind))}</span>
          <span class="work-card__preview-label">${escapeHtml(project.language || "")}</span>
        </div>
        <div class="work-card__body">
          ${org}${role}${link}
          <h3>${escapeHtml(project.name)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <ul class="tag-list">${tags}</ul>
          ${diagram}
        </div>
      </article>`;
  }

  function render(list) {
    projects = list;
    grid.innerHTML = list.map(renderCard).join("");
    if (statProjects) statProjects.textContent = `${list.length}+`;
    bindFilters();
    bindMermaid();
  }

  function bindFilters() {
    filters.forEach((btn) => {
      btn.onclick = () => {
        const value = btn.getAttribute("data-filter");
        filters.forEach((b) => b.classList.toggle("is-active", b === btn));
        grid.querySelectorAll(".work-card").forEach((card) => {
          const kind = card.getAttribute("data-kind");
          card.classList.toggle("is-hidden", value !== "all" && kind !== value);
        });
      };
    });
  }

  function bindMermaid() {
    if (typeof mermaid === "undefined") return;
    mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
    document.querySelectorAll(".work-card__diagram").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (details.open) mermaid.run({ nodes: [details.querySelector(".mermaid")] });
      });
    });
  }

  function mergeByUrl(base, extra) {
    const map = new Map();
    base.forEach((p) => map.set(p.url || `${p.kind}:${p.name}`, p));
    extra.forEach((p) => {
      const key = p.url || `${p.kind}:${p.name}`;
      if (!map.has(key)) map.set(key, p);
    });
    return [...map.values()];
  }

  render(projects);

  fetch(`https://api.github.com/users/${username}/events/public?per_page=30`)
    .then((r) => (r.ok ? r.json() : []))
    .then((events) => {
      const seen = new Set();
      const extras = [];
      events.forEach((evt) => {
        const name = evt.repo?.name;
        if (!name || name.startsWith(`${username}/`) || seen.has(name)) return;
        seen.add(name);
        const [org, repo] = name.split("/");
        extras.push({
          name: repo.replace(/[-_]/g, " "),
          description: `Contributed via ${(evt.type || "").replace("Event", "")} on GitHub.`,
          url: `https://github.com/${name}`,
          language: "GitHub",
          kind: "contribution",
          organization: org,
          role: "Contributor",
          tags: ["Contribution", org],
          mermaidDiagram:
            "flowchart LR\n  Me[My Work] -->|push / PR| Repo[Upstream Repository]\n  Repo --> Main[main branch]",
        });
      });
      if (extras.length) render(mergeByUrl(projects, extras));
    })
    .catch(() => {});
})();

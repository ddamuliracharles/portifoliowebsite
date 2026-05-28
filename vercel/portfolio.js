(function () {
  const grid = document.getElementById("work-grid");
  const statProjects = document.querySelector("[data-stat-projects]");
  if (!grid) return;

  const profile = window.__PROFILE__;
  const username = profile?.githubUsername || "ddamuliracharles";
  const fallback = profile?.projects || [];

  function formatName(name) {
    return (name || "Repository").replace(/[-_]/g, " ");
  }

  function buildTags(language) {
    return language ? [language, "Open Source"] : ["GitHub"];
  }

  function renderCard(project) {
    const tags = (project.tags || buildTags(project.language))
      .map((t) => `<li>${escapeHtml(t)}</li>`)
      .join("");
    return `
      <article class="work-card">
        <div class="work-card__preview">
          <span class="work-card__preview-label">${escapeHtml(project.language || "")}</span>
        </div>
        <div class="work-card__body">
          <a class="work-card__link" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">View Project</a>
          <h3>${escapeHtml(project.name)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <ul class="tag-list">${tags}</ul>
        </div>
      </article>`;
  }

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text || "";
    return d.innerHTML;
  }

  function render(projects) {
    grid.innerHTML = projects.map(renderCard).join("");
    if (statProjects) {
      statProjects.textContent = `${projects.length}+`;
    }
  }

  render(fallback);

  fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((repos) => {
      const projects = repos
        .filter((r) => !r.fork)
        .map((r) => ({
          name: formatName(r.name),
          description: r.description || "Open-source project on GitHub.",
          url: r.html_url,
          language: r.language || "",
          tags: buildTags(r.language),
        }));
      if (projects.length) render(projects);
    })
    .catch(() => {});
})();

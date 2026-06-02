import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "fs";
import { join } from "path";

const profile = JSON.parse(readFileSync("vercel/profile.json", "utf8"));
const contact = JSON.parse(readFileSync("Data/contact.json", "utf8"));
const catalog = JSON.parse(readFileSync("Data/work-catalog.json", "utf8"));
profile.email = contact.recipientEmail;
profile.projects = catalog.projects;
profile.stats = [
  profile.stats[0],
  { value: `${catalog.projects.length}+`, label: "Projects & contributions" },
  profile.stats[2],
];
profile.aboutExtended =
  "I'm a developer who cares about clean code and clear outcomes. My work spans backend APIs, interactive maps, LangChain agents, and client-facing websites—always with an eye on maintainability and what end users actually need.\n\nI learn in public on GitHub, contribute to team and organisation codebases, and ship private client work under NDA. If you need someone who can ship and communicate, let's talk.";

const dist = "dist";
const year = new Date().getFullYear();

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync("wwwroot/css", join(dist, "css"), { recursive: true });
cpSync("wwwroot/js/site.js", join(dist, "js/site.js"));
cpSync("wwwroot/js/contact.js", join(dist, "js/contact.js"));
cpSync("wwwroot/js/projects.js", join(dist, "js/projects.js"));
cpSync("wwwroot/images", join(dist, "images"), { recursive: true });
cpSync("vercel/portfolio.js", join(dist, "js/portfolio.js"));

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const nl = (s) => esc(s).replace(/\n/g, "<br />");

const statsHtml = profile.stats
  .map(
    (s, i) => `
        <div class="stat">
          <span class="stat__value"${i === 1 ? ' data-stat-projects' : ""}>${esc(s.value)}</span>
          <span class="stat__label">${esc(s.label)}</span>
        </div>`
  )
  .join("");

const highlightsHtml = profile.highlights
  .map(
    (h) => `
                <article class="highlight-card">
                  <h3>${esc(h.title)}</h3>
                  <p>${esc(h.description)}</p>
                </article>`
  )
  .join("");

const skillsHtml = profile.skillCategories
  .map(
    (c) => `
                <article class="skill-card">
                  <h3>${esc(c.title)}</h3>
                  <ul>${c.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
                </article>`
  )
  .join("");

const kindLabels = {
  personal: "Personal",
  organization: "Organization",
  contribution: "Open Source Contribution",
  private: "Private",
};

const projectsHtml = profile.projects
  .map((p) => {
    const kind = p.kind || "personal";
    const link =
      p.url && !p.isPrivate
        ? `<a class="work-card__link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">View on GitHub</a>`
        : p.isPrivate
          ? `<span class="work-card__link work-card__link--muted">Private repository</span>`
          : "";
    const org = p.organization ? `<p class="work-card__org">${esc(p.organization)}</p>` : "";
    const role = p.role ? `<p class="work-card__role">${esc(p.role)}</p>` : "";
    const diagram = p.mermaidDiagram
      ? `<details class="work-card__diagram"><summary>Architecture diagram</summary><pre class="mermaid">${esc(p.mermaidDiagram)}</pre></details>`
      : "";
    const tags = (p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
    return `
      <article class="work-card" data-kind="${esc(kind)}">
        <div class="work-card__preview">
          <span class="work-card__badge work-card__badge--${esc(kind)}">${esc(kindLabels[kind] || "Personal")}</span>
          <span class="work-card__preview-label">${esc(p.language || "")}</span>
        </div>
        <div class="work-card__body">
          ${org}${role}${link}
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.description)}</p>
          <ul class="tag-list">${tags}</ul>
          ${diagram}
        </div>
      </article>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${esc(profile.fullName)} — ${esc(profile.title)}. GIS, AI, and full-stack projects." />
  <link rel="canonical" href="https://ddamuliracharles.vercel.app/" />
  <title>${esc(profile.fullName)} — ${esc(profile.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/site.css" />
</head>
<body>
  <header class="site-header">
    <nav class="nav container" aria-label="Main">
      <a class="nav__brand" href="/">ddamuliracharles<span>.dev</span></a>
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
      <ul id="nav-menu" class="nav__links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section id="home" class="hero container">
      <div class="hero__content">
        <span class="badge">Available for new projects</span>
        <h1 class="hero__headline">
          I craft digital<br />
          <span class="text-gradient">experiences</span> that<br />
          solve real problems.
        </h1>
        <p class="hero__intro">${nl(profile.bio)}</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#projects">View My Work</a>
          <a class="btn btn--outline" href="#contact">Get in Touch</a>
        </div>
        <div class="hero__stats">${statsHtml}
        </div>
      </div>
      <div class="hero__visual">
        <div class="hero-orbit" aria-hidden="true">
          <ul class="orbit-ring orbit-ring--outer">
            <li style="--i: 0"><span class="orbit-icon" title="C#"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/csharp/csharp-original.svg" alt="" /></span></li>
            <li style="--i: 1"><span class="orbit-icon" title=".NET"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/dot-net/dot-net-original.svg" alt="" /></span></li>
            <li style="--i: 2"><span class="orbit-icon" title="JavaScript"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/javascript/javascript-original.svg" alt="" /></span></li>
            <li style="--i: 3"><span class="orbit-icon" title="TypeScript"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/typescript/typescript-original.svg" alt="" /></span></li>
            <li style="--i: 4"><span class="orbit-icon" title="Python"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/python/python-original.svg" alt="" /></span></li>
            <li style="--i: 5"><span class="orbit-icon" title="GitHub"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/github/github-original.svg" alt="" /></span></li>
          </ul>
          <ul class="orbit-ring orbit-ring--inner">
            <li style="--i: 0"><span class="orbit-icon" title="Node.js"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/nodejs/nodejs-original.svg" alt="" /></span></li>
            <li style="--i: 1"><span class="orbit-icon" title="Docker"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/docker/docker-original.svg" alt="" /></span></li>
            <li style="--i: 2"><span class="orbit-icon" title="PostgreSQL"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/postgresql/postgresql-original.svg" alt="" /></span></li>
            <li style="--i: 3"><span class="orbit-icon" title="React"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@2.16.0/icons/react/react-original.svg" alt="" /></span></li>
          </ul>
          <div class="avatar">
            <img class="avatar__photo" src="/images/profile.png" alt="Portrait of ${esc(profile.fullName)}" width="320" height="320" />
          </div>
        </div>
        <p class="hero__name-card">${esc(profile.fullName)}</p>
      </div>
    </section>
    <section id="about" class="section container">
      <span class="section-label">About</span>
      <h2 class="section-title">A developer who cares<br />about the details.</h2>
      <div class="about-grid">
        <div class="about-grid__text">
          <p>${nl(profile.aboutExtended)}</p>
          <ul class="about-metrics">
            <li><strong>5+</strong> Years building software</li>
            <li><strong>8+</strong> Public GitHub repositories</li>
            <li><strong>Open</strong> to freelance &amp; collaborations</li>
          </ul>
        </div>
        <div class="highlight-grid">${highlightsHtml}
        </div>
      </div>
    </section>
    <section id="skills" class="section section--alt">
      <div class="container">
        <span class="section-label">Skills</span>
        <h2 class="section-title">Technologies I work with.</h2>
        <p class="section-desc">A versatile toolkit spanning backend, frontend, GIS, and AI.</p>
        <div class="skills-grid">${skillsHtml}
        </div>
      </div>
    </section>
    <section id="projects" class="section container">
      <span class="section-label">Work</span>
      <h2 class="section-title">All my work.</h2>
      <p class="section-desc">Personal repos, organisation delivery, open-source contributions, and private client systems. Also on <a href="${esc(profile.githubUrl)}" target="_blank" rel="noopener noreferrer">@${esc(profile.githubUsername)}</a>.</p>
      <div class="work-filters" role="tablist" aria-label="Filter projects">
        <button type="button" class="work-filter is-active" data-filter="all">All</button>
        <button type="button" class="work-filter" data-filter="personal">Personal</button>
        <button type="button" class="work-filter" data-filter="organization">Organisation</button>
        <button type="button" class="work-filter" data-filter="contribution">Contributions</button>
        <button type="button" class="work-filter" data-filter="private">Private</button>
      </div>
      <div id="work-grid" class="work-grid">${projectsHtml}</div>
    </section>
    <section id="contact" class="section section--contact">
      <div class="container">
        <span class="section-label">Contact</span>
        <h2 class="section-title">Let's work together.</h2>
        <p class="section-desc">Have a project in mind? I'd love to hear about it.</p>
        <div class="contact-grid">
          <div class="contact-info">
            <div class="contact-item"><h3>Email</h3><a href="mailto:${esc(profile.email)}?subject=Portfolio%20inquiry">${esc(profile.email)}</a><button type="button" class="contact-copy" id="copy-email-btn">Copy email</button></div>
            <div class="contact-item"><h3>Phone</h3><a href="tel:+256786398295">${esc(profile.phone)}</a></div>
            <div class="contact-item"><h3>Location</h3><p>${esc(profile.location)}</p></div>
            <div class="contact-item"><h3>GitHub</h3><a href="${esc(profile.githubUrl)}" target="_blank" rel="noopener noreferrer">@${esc(profile.githubUsername)}</a></div>
          </div>
          <form class="contact-form" id="contact-form" novalidate>
            <input type="text" name="_gotcha" class="contact-form__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <div class="form-row"><label for="name">Name</label><input type="text" id="name" name="name" required autocomplete="name" maxlength="120" /></div>
            <div class="form-row"><label for="email">Your email</label><input type="email" id="email" name="email" required autocomplete="email" maxlength="254" /></div>
            <div class="form-row"><label for="subject">Subject</label><input type="text" id="subject" name="subject" required maxlength="200" /></div>
            <div class="form-row"><label for="message">Message</label><textarea id="message" name="message" rows="5" required minlength="10" maxlength="5000"></textarea></div>
            <div id="contact-feedback" class="contact-feedback" role="alert" aria-live="assertive" aria-atomic="true" hidden>
              <span id="contact-feedback-icon" class="contact-feedback__icon" aria-hidden="true"></span>
              <div class="contact-feedback__body">
                <strong id="contact-feedback-title"></strong>
                <p id="contact-feedback-detail"></p>
              </div>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <span class="site-footer__brand">ddamuliracharles.dev</span>
      <p>&copy; ${year} ${esc(profile.fullName)}. All rights reserved.</p>
    </div>
  </footer>
  <script>window.__PROFILE__ = ${JSON.stringify(profile)};</script>
  <script>window.portfolioContact = ${JSON.stringify({
    recipientEmail: contact.recipientEmail,
    email: contact.recipientEmail,
    formsubmitUrl: contact.formsubmitUrl,
  })};</script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script src="/js/site.js"></script>
  <script src="/js/contact.js"></script>
  <script src="/js/projects.js"></script>
  <script src="/js/portfolio.js"></script>
</body>
</html>`;

writeFileSync(join(dist, "index.html"), html);
console.log("Vercel static build complete → dist/");

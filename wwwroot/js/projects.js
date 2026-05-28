(function () {
  const grid = document.getElementById("work-grid");
  const filters = document.querySelectorAll(".work-filter");
  if (!grid) return;

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-filter");
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      grid.querySelectorAll(".work-card").forEach((card) => {
        const kind = card.getAttribute("data-kind");
        const show = value === "all" || kind === value;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  function initMermaid() {
    if (typeof mermaid === "undefined") return;
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });
    mermaid.run({ querySelector: ".mermaid" });
  }

  document.querySelectorAll(".work-card__diagram").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (details.open) initMermaid();
    });
  });

  if (document.querySelector("script[src*='mermaid']")) {
    const wait = setInterval(() => {
      if (typeof mermaid !== "undefined") {
        clearInterval(wait);
        initMermaid();
      }
    }, 100);
  }
})();

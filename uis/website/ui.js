const toggle = document.querySelector("#nav-toggle");
const links = document.querySelector("#nav-links");

if (toggle && links) {
  const desktop = matchMedia("(min-width: 48rem)");

  function setExpanded(expanded) {
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
    links.classList.toggle("hidden", !desktop.matches && !expanded);
    links.classList.toggle("flex", desktop.matches || expanded);
  }

  toggle.classList.remove("hidden");
  toggle.classList.add("flex");
  setExpanded(false);
  toggle.addEventListener("click", () => {
    setExpanded(toggle.getAttribute("aria-expanded") !== "true");
  });
  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) setExpanded(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setExpanded(false);
      toggle.focus();
    }
  });
  desktop.addEventListener("change", () => setExpanded(false));
}
// Replace these placeholder store URLs with the final App Store and Mac App Store URLs before launch.
const STORE_LINKS = {
    ios: "https://example.com/passo-ios-app-store",
    mac: "https://example.com/passo-mac-app-store"
};

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const revealNodes = document.querySelectorAll(".reveal");
const storeLinks = document.querySelectorAll("[data-store-link]");

storeLinks.forEach((link) => {
    const target = link.getAttribute("data-store-link");
    if (target && STORE_LINKS[target]) {
        link.setAttribute("href", STORE_LINKS[target]);
    }
});

if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
        nav.classList.toggle("is-open", !expanded);
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16,
            rootMargin: "0px 0px -48px 0px"
        }
    );

    revealNodes.forEach((node, index) => {
        node.style.setProperty("--reveal-delay", `${Math.min(index * 30, 240)}ms`);
        observer.observe(node);
    });
} else {
    revealNodes.forEach((node) => {
        node.classList.add("is-visible");
    });
}

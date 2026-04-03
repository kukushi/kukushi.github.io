const STORE_LINKS = {
    ios: "https://example.com/passo-ios-app-store",
    mac: "https://example.com/passo-mac-app-store"
};

document.querySelectorAll("[data-store-link]").forEach((link) => {
    const target = link.getAttribute("data-store-link");
    if (target && STORE_LINKS[target]) {
        link.setAttribute("href", STORE_LINKS[target]);
    }
});

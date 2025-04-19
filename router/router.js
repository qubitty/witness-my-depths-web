import { renderPoemView } from '../views/poemView.js';
import { renderListView } from '../views/listView.js';
import { renderZineView } from '../views/zineView.js';

export function navigateTo(url) {
    const fullPath = window.basePath + url;
    history.pushState(null, null, fullPath);
    route();
}

export function initRouter() {
    console.log("Initializing router with base path:", window.basePath);
    window.addEventListener('popstate', route);
    route();
}

export function route() {
    const path = window.location.pathname;

    // Remove basePath from the path for routing
    const relativePath = path.replace(window.basePath, '') || '/';

    if (relativePath === "/") {
        renderZineView();
    } else if (relativePath === "/all") {
        renderListView();
    } else if (relativePath.startsWith("/poems/")) {
        const [, , folder, ...rest] = relativePath.split("/");
        const title = rest.join("/").replace(/\.md$/, "");
        renderPoemView(folder, title);
    } else {
        renderNotFound();
    }
}

function renderNotFound() {
  document.getElementById("content").innerHTML = "<h2>404: Not Found</h2>";
}

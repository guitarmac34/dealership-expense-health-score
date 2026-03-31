import React from "react";
import ReactDOM from "react-dom/client";
import HealthScore from "./HealthScore";
import styles from "./index.css?inline";

function mount(container: HTMLElement) {
  // Use shadow DOM for CSS isolation when embedded in WordPress
  const shadow = container.attachShadow({ mode: "open" });

  // Inject styles into shadow DOM
  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  // Load Inter font in the document head (fonts must be in document scope)
  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(fontLink);
  }

  // Create mount point inside shadow DOM
  const appRoot = document.createElement("div");
  shadow.appendChild(appRoot);

  // Read config from data attributes
  const ctaUrl = container.dataset.ctaUrl;

  ReactDOM.createRoot(appRoot).render(
    <React.StrictMode>
      <HealthScore ctaUrl={ctaUrl} />
    </React.StrictMode>
  );
}

// Auto-mount if the target element exists
const target = document.getElementById("ss-health-score");
if (target) {
  mount(target);
}

// Export for manual mounting
export { mount };

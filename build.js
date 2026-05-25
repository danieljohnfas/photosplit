const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const COMPONENTS_DIR = path.join(DIR, "components");

const headerTpl = fs.readFileSync(
  path.join(COMPONENTS_DIR, "header.html"),
  "utf8",
);
const footerTpl = fs.readFileSync(
  path.join(COMPONENTS_DIR, "footer.html"),
  "utf8",
);
const gearTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "gear.html"), "utf8");
const modalsTpl = fs.readFileSync(
  path.join(COMPONENTS_DIR, "modals.html"),
  "utf8",
);

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html"));

files.forEach((file) => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;

  // Replace Header
  let pageHeader = headerTpl;

  // Handle active states
  const baseName = file.replace(".html", "").toUpperCase();
  pageHeader = pageHeader.replace(`<!-- NAV_ACTIVE_${baseName} -->`, "active");
  // clear out the rest
  pageHeader = pageHeader.replace(/<!-- NAV_ACTIVE_[A-Z]+ -->/g, "");

  // Handle app.html specifics
  if (file === "app.html") {
    pageHeader = pageHeader.replace(
      "<!-- INJECT_APP_VOICE_TOGGLE -->",
      `<button class="btn btn-secondary btn-sm btn-voice-toggle" id="btn-voice-toggle" onclick="PremiumEngine.toggleVoice()">🎙️ Voice Control</button>`,
    );
    pageHeader = pageHeader.replace(
      "<!-- INJECT_APP_TOOLS -->",
      `<button aria-label="Toggle sounds" class="icon-btn" id="sound-toggle" title="Mute sounds">🔊</button>`,
    );
    pageHeader = pageHeader.replace(
      "<!-- INJECT_APP_SHORTCUTS -->",
      `<button aria-label="Show keyboard shortcuts" class="icon-btn" id="btn-shortcuts" title="Keyboard shortcuts"><svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16"><rect height="12" rx="2" width="20" x="2" y="6"></rect><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"></path></svg></button>`,
    );
  } else {
    pageHeader = pageHeader.replace("<!-- INJECT_APP_VOICE_TOGGLE -->", "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_TOOLS -->", "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_SHORTCUTS -->", "");
  }

  content = content.replace(
    /<header id="site-header">[\s\S]*?<\/header>/i,
    pageHeader,
  );
  content = content.replace(
    /<footer class="site-footer">[\s\S]*?<\/footer>/i,
    footerTpl,
  );
  content = content.replace(
    /<section class="gear-section">[\s\S]*?<\/section>/i,
    gearTpl,
  );

  // Strip hardcoded old cookie consent and scripts if they exist (non-standardized versions)
  content = content.replace(
    /<div id="cookie-consent" role="dialog">[\s\S]*?(<\/script>\s*)?<\/body>/i,
    "</body>",
  );

  // Also strip any old modals block we might have injected previously
  content = content.replace(
    /<!-- MODALS START -->[\s\S]*?<!-- MODALS END -->\s*/i,
    "",
  );

  // Inject the standardized modals just before the closing body tag
  content = content.replace(/<\/body>/i, modalsTpl + "\n</body>");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated ${file}`);
  }
});

// Run this logic on blog posts as well
const BLOG_DIR = path.join(DIR, "blog");
if (fs.existsSync(BLOG_DIR)) {
  const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".html"));
  blogFiles.forEach((file) => {
    const filePath = path.join(BLOG_DIR, file);
    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;

    let pageHeader = headerTpl;
    pageHeader = pageHeader.replace("<!-- NAV_ACTIVE_BLOG -->", "active");
    pageHeader = pageHeader.replace(/<!-- NAV_ACTIVE_[A-Z]+ -->/g, "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_VOICE_TOGGLE -->", "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_TOOLS -->", "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_SHORTCUTS -->", "");

    // Blog paths need relative adjustments for assets, but actually all links are absolute starting with /
    // So we can use the same templates
    content = content.replace(
      /<header id="site-header">[\s\S]*?<\/header>/i,
      pageHeader,
    );
    content = content.replace(
      /<footer class="site-footer">[\s\S]*?<\/footer>/i,
      footerTpl,
    );
    content = content.replace(
      /<section class="gear-section">[\s\S]*?<\/section>/i,
      gearTpl,
    );

    content = content.replace(
      /<div id="cookie-consent" role="dialog">[\s\S]*?(<\/script>\s*)?<\/body>/i,
      "</body>",
    );
    content = content.replace(
      /<!-- MODALS START -->[\s\S]*?<!-- MODALS END -->\s*/i,
      "",
    );
    content = content.replace(/<\/body>/i, modalsTpl + "\n</body>");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated blog/${file}`);
    }
  });
}

console.log("Layout standardization complete.");

const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const COMPONENTS_DIR = path.join(DIR, "components");

const headerTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "header.html"), "utf8");
const footerTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "footer.html"), "utf8");
const modalsTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "modals.html"), "utf8");
const adTopTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "ad-banner-top.html"), "utf8");
const adBottomTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "ad-banner-bottom.html"), "utf8");
const adSidebarTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "ad-sidebar.html"), "utf8");
const gameStripTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "game-strip.html"), "utf8");
const socialShareTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "social-share.html"), "utf8");
const adScriptsTpl = fs.readFileSync(path.join(COMPONENTS_DIR, "ad-scripts.html"), "utf8");

// Pages that should NOT have a right sidebar
const noSidebarPages = ['app.html', 'convert.html', 'crop.html', 'resize.html', 'passport.html', 'transcribe.html', 'index.html'];

// Pages that ARE tools
const toolPages = ['app.html', 'convert.html', 'crop.html', 'resize.html', 'passport.html', 'transcribe.html'];

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".html"));

files.forEach((file) => {
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;
  const isNoSidebar = noSidebarPages.includes(file);
  const isToolPage = toolPages.includes(file);

  let pageHeader = headerTpl;
  const baseName = file.replace(".html", "").toUpperCase();
  pageHeader = pageHeader.replace(`<!-- NAV_ACTIVE_${baseName} -->`, "active");
  pageHeader = pageHeader.replace(/<!-- NAV_ACTIVE_[A-Z]+ -->/g, "");

  if (file === "app.html") {
    pageHeader = pageHeader.replace("<!-- INJECT_APP_VOICE_TOGGLE -->", `<button class="btn btn-secondary btn-sm btn-voice-toggle" id="btn-voice-toggle" onclick="PremiumEngine.toggleVoice()">🎙️ Voice Control</button>`);
    pageHeader = pageHeader.replace("<!-- INJECT_APP_TOOLS -->", `<button aria-label="Toggle sounds" class="icon-btn" id="sound-toggle" title="Mute sounds">🔊</button>`);
    pageHeader = pageHeader.replace("<!-- INJECT_APP_SHORTCUTS -->", `<button aria-label="Show keyboard shortcuts" class="icon-btn" id="btn-shortcuts" title="Keyboard shortcuts"><svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16"><rect height="12" rx="2" width="20" x="2" y="6"></rect><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"></path></svg></button>`);
  } else {
    pageHeader = pageHeader.replace("<!-- INJECT_APP_VOICE_TOGGLE -->", "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_TOOLS -->", "");
    pageHeader = pageHeader.replace("<!-- INJECT_APP_SHORTCUTS -->", "");
  }

  // Strip existing
  content = content.replace(/<!-- TOP AD BANNER -->[\s\S]*?<!-- END TOP AD BANNER -->\s*/gi, '');
  content = content.replace(/<!-- BOTTOM AD BANNER -->[\s\S]*?<!-- END BOTTOM AD BANNER -->\s*/gi, '');
  content = content.replace(/<!-- SOCIAL SHARE COMPONENT -->[\s\S]*?<!-- END SOCIAL SHARE COMPONENT -->\s*/gi, '');
  content = content.replace(/<!-- GAME STRIP COMPONENT -->[\s\S]*?<!-- END GAME STRIP COMPONENT -->\s*/gi, '');
  
  // Clean up any old duplicate ad containers
  content = content.replace(/<div id="container-a25495e0c3bb3c8d42df39bb0b421e4a"><\/div>\s*/g, '');

  // Header injection (just the ad top, NO game strip)
  let headerInjection = pageHeader + "\n" + adTopTpl + "\n";

  content = content.replace(/<header id="site-header">[\s\S]*?<\/header>/i, headerInjection);
  content = content.replace(/<nav class="site-nav">[\s\S]*?<\/nav>/i, headerInjection);

  // Tools ad injection (right after header)
  if (isToolPage) {
    if (!content.includes('<!-- IN-TOOL AD -->')) {
      content = content.replace(/<(div|main) class="tool-workspace"([^>]*)>/i, `<$1 class="tool-workspace"$2>\n<!-- IN-TOOL AD -->\n${adTopTpl}\n<!-- END IN-TOOL AD -->\n`);
    } else {
      content = content.replace(/<!-- IN-TOOL AD -->[\s\S]*?<!-- END IN-TOOL AD -->\s*/gi, `<!-- IN-TOOL AD -->\n${adTopTpl}\n<!-- END IN-TOOL AD -->\n`);
    }
  }

  // Footer injection (Game strip goes ABOVE footer)
  let footerInjection = gameStripTpl + "\n" + adBottomTpl + "\n" + footerTpl;
  content = content.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/i, footerInjection);

  // Sidebar injection
  if (!isNoSidebar) {
    content = content.replace(/<aside class="page-sidebar">[\s\S]*?<\/aside>/i, `<aside class="page-sidebar">\n${adSidebarTpl}\n</aside>`);
  }

  content = content.replace(/<section class="gear-section">[\s\S]*?<\/section>\s*/gi, '');
  content = content.replace(/<script[^>]*src="\/js\/gear\.js"[^>]*><\/script>\s*/gi, '');

  let prevContent;
  do {
    prevContent = content;
    content = content.replace(/<!-- MODALS START -->[\s\S]*?<!-- MODALS END -->\s*/i, '');
  } while (content !== prevContent);

  content = content.replace(/<!-- Modals & Scripts -->[\s\S]*?(?=<!-- MODALS START -->|<div id="cookie-consent"|<\/body>)/i, '');
  content = content.replace(/(<div id="cookie-consent"[\s\S]*?<\/div>\s*<\/div>\s*)(<script>[\s\S]*?<\/script>\s*)?(?=<\/body>)/i, '');
  content = content.replace(/<!-- GLOBAL AD SCRIPTS \(Popunder & Social Bar\) -->[\s\S]*?<!-- END GLOBAL AD SCRIPTS -->\s*/gi, '');
  content = content.replace(/\s*<\/body>/i, '\n' + adScriptsTpl + '\n' + modalsTpl + '\n</body>');

  if (!content.includes('rel="manifest"')) {
    content = content.replace(/<\/head>/i, '  <link rel="manifest" href="/manifest.json">\n</head>');
  }

  // Inject JSON-LD if not present (only for blog pages)
  if (file.includes('blog') && !content.includes('application/ld+json')) {
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || content.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const description = descMatch ? descMatch[1].trim() : "PhotoSplit Studio Blog";
      const schema = `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${title}",
        "description": "${description}",
        "publisher": {
          "@type": "Organization",
          "name": "PhotoSplit Studio",
          "logo": {
            "@type": "ImageObject",
            "url": "https://photosplitstudio.com/assets/images/logo.png"
          }
        }
      }
      </script>`;
      content = content.replace(/<\/head>/i, `  ${schema}\n</head>`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated ${file}`);
  }
});

// Run this logic on blog posts
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

    content = content.replace(/<!-- TOP AD BANNER -->[\s\S]*?<!-- END TOP AD BANNER -->\s*/gi, '');
    content = content.replace(/<!-- BOTTOM AD BANNER -->[\s\S]*?<!-- END BOTTOM AD BANNER -->\s*/gi, '');
    content = content.replace(/<!-- SOCIAL SHARE COMPONENT -->[\s\S]*?<!-- END SOCIAL SHARE COMPONENT -->\s*/gi, '');
    content = content.replace(/<!-- GAME STRIP COMPONENT -->[\s\S]*?<!-- END GAME STRIP COMPONENT -->\s*/gi, '');
    content = content.replace(/<!-- IN-CONTENT AD -->[\s\S]*?<!-- END IN-CONTENT AD -->\s*/gi, '');
    content = content.replace(/<div id="container-a25495e0c3bb3c8d42df39bb0b421e4a"><\/div>\s*/g, '');

    // Blog Header: No game strip!
    let headerInjection = pageHeader + "\n" + adTopTpl + "\n" + socialShareTpl + "\n";
    content = content.replace(/<header id="site-header">[\s\S]*?<\/header>/i, headerInjection);
    content = content.replace(/<nav class="site-nav">[\s\S]*?<\/nav>/i, headerInjection);

    // Blog in-content ad injection (after 2nd paragraph)
    let pCount = 0;
    content = content.replace(/<p>/gi, (match) => {
      pCount++;
      if (pCount === 3) {
        return `<!-- IN-CONTENT AD -->\n${adTopTpl}\n<!-- END IN-CONTENT AD -->\n<p>`;
      }
      return match;
    });

    // Blog Footer: Game strip ABOVE footer!
    let footerInjection = gameStripTpl + "\n" + adBottomTpl + "\n" + footerTpl;
    content = content.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/i, footerInjection);
    
    // Blog gets sidebar
    content = content.replace(/<aside class="page-sidebar">[\s\S]*?<\/aside>/i, `<aside class="page-sidebar">\n${adSidebarTpl}\n</aside>`);
    content = content.replace(/<section class="gear-section">[\s\S]*?<\/section>\s*/gi, '');
    content = content.replace(/<script[^>]*src="\/js\/gear\.js"[^>]*><\/script>\s*/gi, '');

    let prevContent;
    do {
      prevContent = content;
      content = content.replace(/<!-- MODALS START -->[\s\S]*?<!-- MODALS END -->\s*/i, '');
    } while (content !== prevContent);

    content = content.replace(/<!-- Modals & Scripts -->[\s\S]*?(?=<!-- MODALS START -->|<div id="cookie-consent"|<\/body>)/i, '');
    content = content.replace(/(<div id="cookie-consent"[\s\S]*?<\/div>\s*<\/div>\s*)(<script>[\s\S]*?<\/script>\s*)?(?=<\/body>)/i, '');
    content = content.replace(/<!-- GLOBAL AD SCRIPTS \(Popunder & Social Bar\) -->[\s\S]*?<!-- END GLOBAL AD SCRIPTS -->\s*/gi, '');
    content = content.replace(/\s*<\/body>/i, '\n' + adScriptsTpl + '\n' + modalsTpl + '\n</body>');

    if (!content.includes('rel="manifest"')) {
      content = content.replace(/<\/head>/i, '  <link rel="manifest" href="/manifest.json">\n</head>');
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated blog/${file}`);
    }
  });
}

console.log("Layout standardization complete.");

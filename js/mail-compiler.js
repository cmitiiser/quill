let templateHTML = "";

fetch("template.html")
  .then((response) => {
    if (!response.ok) throw new Error("Failed to load template.html");
    return response.text();
  })
  .then((data) => {
    templateHTML = data;
    updateOutput();
  })
  .catch((err) => console.error("Error loading template:", err));

const defaultDSL = `
// Global Directives
.title: Feature Showcase & Integration Testing Guide
.banner: https://cmit.iisertvm.ac.in/assets/icons/mail_banner.jpg

// Banner / Image Block / Poster Block
img {
  https://picsum.photos/600/250
}
.width: 100%
.align: center
.alt: Feature Showcase Header Banner

// Button Block (Call-to-Action)
btn {
  Click Here!
}
.url: google.com
.bg-color: #27ae60
.color: #ffffff
.padding: 15px
.align: center
.border-radius: 50px
.margin: 50px 0

// Introductory Paragraph with Inline Formatting
p {
  Welcome to the **Email Builder DSL** test template! This script is designed as a *comprehensive boilerplate* to demonstrate every block type, modifier property, and text formatting option supported by the compiler.
}
.color: #2c3e50
.line-height: 1.6
.align: left
.margin: 15px 0

// Horizontal Divider (Dashed)
div {}
.border-top: 1px dashed #0066cc
.margin: 25px 0

// Unordered List Block (Custom List Style & Spacing)
list {
  * **Global Directives:** Title assignment via .title: directive
  * **Inline Formatting:** Supports **bold**, *italics*, and smart hyperlinking
  * **Auto-prefixed Link:** Visit [IISER TVM CMIT](cmit.iisertvm.ac.in) for details
  * **Explicit Web Link:** Check [Google](https://www.google.com) safely
  * **Email Link Scheme:** Contact [Support Team](mailto:support@example.com) directly
}
.padding: 10px 0 10px 20px
.margin: 10px 0
.color: #34495e
.line-height: 1.5

// Secondary Divider (Solid Border)
div {}
.border-top: 2px solid #cccccc
.margin: 20px 0

// Ordered List Block (Step-by-Step Guide)
ol {
  1. **Configure Directives:** Set your global template variables at the top.
  2. **Build Content:** Combine \`p\`, \`list\`, \`ul\`, \`ol\`, and \`img\` blocks.
  3. **Apply Modifiers:** Add \`.property: value\` modifiers directly after closing braces \`}\`.
  4. **Easy Compile:** Render clean, email-compliant HTML automatically!
}
.padding: 5px 0 5px 20px
.margin: 15px 0
.font-size: 16px
.color: #27ae60

// Paragraph Block with Preserved Formatting (.pre: true)
p {
  System Status Log:
    - Block Compiler : OK
    - Link Target    : target="_blank"
    - Output Mode    : Email HTML Wrapped
}
.pre: true
.color: #555555
.font-size: 13px
.line-height: 1.4
.margin: 20px 0
.padding: 12px
.align: left

// Unstyled Bullet List (list-style: none)
ul {
  * *Note:* This list demonstrates the \`.list-style: none\` modifier.
  * Bullet symbols and default left padding are removed.
}
.list-style: none
.padding: 0
.margin: 15px 0
.color: #7f8c8d
.font-size: 15px

// Closing Paragraph
p {
  For more information or inquiries, feel free to reach out to the [CMIT Website Team](mailto:mathsclub@iisertvm.ac.in).
}
.align: center
.color: #888888
.font-size: 12px
.margin: 30px 0 10px 0`;

let generatedHTML = "";

// Usable inner content width: 744px total card width - (45px padding * 2) = 654px
const CONTENT_INNER_WIDTH = 744;

function parseInlineMarkdown(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, label, url) => {
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl) && !/^mailto:/i.test(cleanUrl)) {
        cleanUrl = "https://" + cleanUrl;
      }
      return `<a href="${cleanUrl}" target="_blank" style="color: #0066cc; text-decoration: underline;">${label}</a>`;
    });
}

function resolvePixelWidth(widthStr, baseWidth = CONTENT_INNER_WIDTH) {
  if (!widthStr) return baseWidth;
  const raw = String(widthStr).trim();
  if (raw.endsWith("%")) {
    const pct = parseFloat(raw) / 100;
    return Math.round(baseWidth * pct);
  }
  if (raw.endsWith("px")) {
    return parseInt(raw, 10);
  }
  const numeric = parseInt(raw, 10);
  return !isNaN(numeric) ? numeric : baseWidth;
}

function compileEmailTemplate(dslInput) {
  if (!templateHTML) return "Loading template...";

  const lines = dslInput.split("\n");
  let title = "CMIT Announcement";
  const DEFAULT_BANNER =
    "https://raw.githubusercontent.com/cmitiiser/cmitiiser.github.io/main/assets/icons/mail_banner.jpg";
  let banner = DEFAULT_BANNER;

  let blocks = [];
  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || line.startsWith("//")) {
      if (!currentBlock) continue;
    }

    if (line.startsWith(".title:") && !currentBlock) {
      title = line.substring(7).trim();
      continue;
    }

    if (line.startsWith(".banner:") && !currentBlock) {
      let url = line.substring(8).trim();
      if (url && !/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      banner = url || DEFAULT_BANNER;
      continue;
    }

    if (line.endsWith("{}") && !currentBlock) {
      const blockType = line.slice(0, -2).trim();
      blocks.push({ type: blockType, bodyLines: [], props: {} });
      continue;
    }

    if (line.endsWith("{") && !currentBlock) {
      const blockType = line.slice(0, -1).trim();
      currentBlock = { type: blockType, bodyLines: [], props: {} };
      continue;
    }

    if (line === "}" && currentBlock) {
      blocks.push(currentBlock);
      currentBlock = null;
      continue;
    }

    if (currentBlock) {
      currentBlock.bodyLines.push(rawLine);
      continue;
    }

    if (line.startsWith(".") && blocks.length > 0) {
      const lastBlock = blocks[blocks.length - 1];
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        const key = line.substring(1, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        lastBlock.props[key] = value;
      }
    }
  }

  const renderedContent = blocks.map(renderBlock).join("\n\n");

  return templateHTML
    .replace("${Title}", title)
    .replace("${Banner}", banner)
    .replace("${Content}", renderedContent);
}

function renderBlock(block) {
  const props = block.props;
  let styleRules = [];

  if (block.type === "div") {
    const borderTop = props["border-top"] || "2px solid #cccccc";
    const margin = props["margin"] || "30px 0";

    if (props["align"]) styleRules.push(`text-align: ${props["align"]};`);
    if (props["padding"]) styleRules.push(`padding: ${props["padding"]};`);

    let divWidth = CONTENT_INNER_WIDTH;
    if (props["width"]) {
      divWidth = resolvePixelWidth(props["width"], CONTENT_INNER_WIDTH);
      styleRules.push(`width: ${divWidth}px;`);
    }

    const extraStyles = styleRules.length > 0 ? " " + styleRules.join(" ") : "";
    return `<div style="border-top: ${borderTop}; margin: ${margin};${extraStyles}"></div>`;
  }

  if (props["align"]) styleRules.push(`text-align: ${props["align"]};`);
  if (props["margin"]) styleRules.push(`margin: ${props["margin"]};`);
  if (props["padding"]) styleRules.push(`padding: ${props["padding"]};`);
  if (props["font-size"]) styleRules.push(`font-size: ${props["font-size"]};`);
  if (props["line-height"])
    styleRules.push(`line-height: ${props["line-height"]};`);
  if (props["color"]) styleRules.push(`color: ${props["color"]};`);

  let rawBodyText =
    props["pre"] === "true"
      ? block.bodyLines.join("\n")
      : block.bodyLines
          .map((l) => l.trim())
          .filter(Boolean)
          .join(" ");

  switch (block.type) {
    case "img": {
      let imgUrl = rawBodyText.trim();

      if (imgUrl && !/^https?:\/\//i.test(imgUrl)) {
        imgUrl = "https://" + imgUrl;
      }

      const finalPixelWidth = resolvePixelWidth(
        props["width"],
        CONTENT_INNER_WIDTH,
      );

      const imgStyleRules = [
        "display: block;",
        `width: ${finalPixelWidth}px;`,
        "height: auto;",
        "border: 0px;",
      ];

      const textAlign = props["align"] || "left";

      if (textAlign === "center") {
        imgStyleRules.push("margin-left: auto;", "margin-right: auto;");
      } else if (textAlign === "right") {
        imgStyleRules.push("margin-left: auto;", "margin-right: 0;");
      }

      if (props["margin"]) imgStyleRules.push(`margin: ${props["margin"]};`);

      const altText = props["alt"] || "Image";
      const imgTag = `<img src="${imgUrl}" alt="${altText}" width="${finalPixelWidth}" style="${imgStyleRules.join(" ")}" />`;

      // Center the outer wrapper box itself within the content cell
      const wrapperMargin =
        textAlign === "center"
          ? "margin: 0 auto;"
          : textAlign === "right"
            ? "margin-left: auto; margin-right: 0;"
            : "margin: 0;";

      return `<div align="${textAlign}" style="text-align: ${textAlign}; width: ${CONTENT_INNER_WIDTH}px; max-width: 100%; ${wrapperMargin}">${imgTag}</div>`;
    }

    case "p": {
      const parsedText = parseInlineMarkdown(rawBodyText);
      const preStyle = props["pre"] === "true" ? "white-space: pre-wrap;" : "";

      if (!props["font-size"]) styleRules.push("font-size: 18px;");
      if (!props["line-height"]) styleRules.push("line-height: 24px;");

      const combinedStyle = [styleRules.join(" "), preStyle]
        .filter(Boolean)
        .join(" ");
      const attr = combinedStyle ? ` style="${combinedStyle}"` : "";
      return `<p${attr}>${parsedText}</p>`;
    }

    case "list":
    case "ul":
    case "ol": {
      const explicitListStyle = props["list-style"];
      const isNone = explicitListStyle === "none";

      if (explicitListStyle) {
        styleRules.push(`list-style-type: ${explicitListStyle};`);
      } else {
        styleRules.push("list-style-type: none;");
      }

      if (!props["padding"]) {
        styleRules.push(isNone ? "padding-left: 0;" : "padding-left: 10px;");
      }

      const listItems = block.bodyLines
        .map((l) => l.trim())
        .filter(
          (l) => l.startsWith("*") || l.startsWith("-") || /^\d+\./.test(l),
        )
        .map((l) => {
          let prefix = "";
          let itemContent = l;

          if (l.startsWith("*") || l.startsWith("-")) {
            itemContent = l.replace(/^(\*|-)\s*/, "");
            if (!isNone) {
              prefix = "• ";
            }
          } else if (/^\d+\./.test(l)) {
            const match = l.match(/^(\d+\.)\s*/);
            if (match) {
              itemContent = l.substring(match[0].length);
              if (!isNone) {
                prefix = match[1] + " ";
              }
            }
          }

          return `  <li style="margin-bottom: 6px;">${prefix}${parseInlineMarkdown(itemContent)}</li>`;
        })
        .join("\n");

      const attr =
        styleRules.length > 0 ? ` style="${styleRules.join(" ")}"` : "";
      return `<ul${attr}>\n${listItems}\n</ul>`;
    }

    case "btn":
    case "button": {
      const buttonText = parseInlineMarkdown(rawBodyText.trim());
      let buttonUrl = props["url"] || props["href"] || "#";

      if (
        buttonUrl &&
        !/^https?:\/\//i.test(buttonUrl) &&
        !/^mailto:/i.test(buttonUrl)
      ) {
        buttonUrl = "https://" + buttonUrl;
      }

      const bgColor = props["bg-color"] || props["background"] || "#0066cc";
      const textColor = props["color"] || "#ffffff";
      const borderRadius = props["border-radius"] || "4px";
      const fontSize = props["font-size"] || "15px";
      const padding = props["padding"] || "12px 24px";
      const alignment = props["align"] || "center";
      const margin = props["margin"] || "20px 0";

      // Table margin centering based on alignment
      let tableMargin = margin;
      if (alignment === "center") {
        tableMargin = `${margin.split(" ")[0] || "20px"} auto`;
      } else if (alignment === "right") {
        tableMargin = `${margin.split(" ")[0] || "20px"} 0 ${margin.split(" ")[1] || "20px"} auto`;
      }

      return `
<table border="0" cellpadding="0" cellspacing="0" width="${CONTENT_INNER_WIDTH}" align="${alignment}" style="width: ${CONTENT_INNER_WIDTH}px; max-width: 100%; margin: ${tableMargin};">
  <tr>
    <td align="${alignment}">
      <table border="0" cellpadding="0" cellspacing="0" align="${alignment}" style="border-collapse: separate; margin: 0 ${alignment === "center" ? "auto" : "0"};">
        <tr>
          <td align="center" bgcolor="${bgColor}" style="border-radius: ${borderRadius}; background-color: ${bgColor};">
            <a href="${buttonUrl}" target="_blank" style="display: inline-block; padding: ${padding}; font-size: ${fontSize}; color: ${textColor}; text-decoration: none; font-weight: bold; border-radius: ${borderRadius}; border: 1px solid ${bgColor};">
              ${buttonText}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
    }

    default: {
      const attr =
        styleRules.length > 0 ? ` style="${styleRules.join(" ")}"` : "";
      return `<div${attr}>${parseInlineMarkdown(rawBodyText)}</div>`;
    }
  }
}

const dslTextarea = document.getElementById("dsl-input");
const previewFrame = document.getElementById("html-preview");
const codeContainer = document.getElementById("html-code");

const cm = CodeMirror.fromTextArea(dslTextarea, {
  mode: "cmitdsl",
  theme: "cmit",
  lineNumbers: true,
  lineWrapping: true,
  styleActiveLine: true,
  matchBrackets: true,
  tabSize: 2,
  extraKeys: {
    Tab: (cmInstance) => cmInstance.replaceSelection("  "),
  },
});

requestAnimationFrame(() => {
  cm.refresh();
});

function updateOutput() {
  generatedHTML = compileEmailTemplate(cm.getValue());

  codeContainer.textContent = generatedHTML;

  const previewDoc = generatedHTML
    .replace(
      "</head>",
      `
    <style id="preview-scaler-style">
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        background-color: #ffffff;
      }
      #scaler-container {
        position: relative;
        width: 100%;
        overflow: hidden;
      }
      #scaler-canvas {
        position: absolute;
        top: 0;
        left: 0;
        display: inline-block;
        transform-origin: 0 0 !important;
        padding-bottom: 40px !important; /* Safety gutter so footers are never cut off */
      }
    </style>
    <script>
      function fitEmail() {
        const canvas = document.getElementById("scaler-canvas");
        const container = document.getElementById("scaler-container");
        if (!canvas || !container) return;

        // Reset transform to accurately read unscaled dimensions
        canvas.style.transform = "none";
        canvas.style.left = "0px";

        const actualWidth = canvas.scrollWidth;
        const availableWidth = document.documentElement.clientWidth || window.innerWidth;

        // Use scrollHeight to include the full document height even if partially rendered
        const actualHeight = Math.max(canvas.scrollHeight, canvas.offsetHeight);

        if (actualWidth > 0 && availableWidth < actualWidth) {
          const scale = availableWidth / actualWidth;
          canvas.style.transform = "scale(" + scale + ")";
          canvas.style.left = "0px";
          container.style.height = Math.ceil(actualHeight * scale) + "px";
        } else {
          const offset = Math.max(0, Math.floor((availableWidth - actualWidth) / 2));
          canvas.style.transform = "none";
          canvas.style.left = offset + "px";
          container.style.height = actualHeight + "px";
        }
      }

      window.addEventListener('resize', fitEmail);
      window.addEventListener('DOMContentLoaded', fitEmail);
      window.addEventListener('load', fitEmail); // Fires when all images finish loading

      // Auto-recalculate height as images pop in
      if (window.ResizeObserver) {
        new ResizeObserver(() => {
          fitEmail();
        }).observe(document.body);
      }

      // Initial triggers
      setTimeout(fitEmail, 50);
      setTimeout(fitEmail, 300);
      setTimeout(fitEmail, 1000);
    </script>
    </head>`,
    )
    .replace(
      /<body([^>]*)>/i,
      `<body$1><div id="scaler-container"><div id="scaler-canvas">`,
    )
    .replace(/<\/body>/i, `</div></div></body>`);

  previewFrame.srcdoc = previewDoc;
}


cm.setValue(defaultDSL);
cm.on("change", updateOutput);

// Soft refresh for the preview iframe
function refreshPreviewPane() {
  if (!previewFrame) return;

  previewFrame.style.pointerEvents = "auto";
  previewFrame.style.display = "none";
  void previewFrame.offsetHeight;
  previewFrame.style.display = "block";

  updateOutput();

  try {
    if (previewFrame.contentWindow) {
      previewFrame.contentWindow.focus();
    }
  } catch (_) {}
}

function refreshCodePane() {
  updateOutput();
}

window.refreshPreviewPane = refreshPreviewPane;
window.refreshCodePane = refreshCodePane;

function switchTab(tab) {
  const darkToggleBtn = document.getElementById("toggle-dark-mode-btn");
  const copyCodeBtn = document.getElementById("copy-code-btn");
  const previewTab = document.getElementById("tab-preview");
  const codeTab = document.getElementById("tab-code");

  if (tab === "preview") {
    if (previewTab.classList.contains("active")) {
      refreshPreviewPane();
      return;
    }

    previewFrame.style.display = "block";
    codeContainer.style.display = "none";
    previewTab.classList.add("active");
    codeTab.classList.remove("active");

    if (darkToggleBtn) darkToggleBtn.style.display = "flex";
    if (copyCodeBtn) copyCodeBtn.style.display = "none";

    refreshPreviewPane();
  } else if (tab === "code") {
    if (codeTab.classList.contains("active")) {
      refreshCodePane();
      return;
    }

    previewFrame.style.display = "none";
    codeContainer.style.display = "block";
    codeTab.classList.add("active");
    previewTab.classList.remove("active");

    if (darkToggleBtn) darkToggleBtn.style.display = "none";
    if (copyCodeBtn) copyCodeBtn.style.display = "flex";

    refreshCodePane();
  }
}

function downloadHTML() {
  if (!generatedHTML) return;

  const blob = new Blob([generatedHTML], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quill-mail.html";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function copyToClipboard() {
  if (!generatedHTML) return;

  navigator.clipboard
    .writeText(generatedHTML)
    .then(() => {
      const btn =
        document.getElementById("copy-code-btn") ||
        document.getElementById("copy-btn");
      if (btn) {
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 2000);
      }
    })
    .catch((err) => {
      console.error("Failed to copy code: ", err);
    });
}

/* ---- Documentation modal ---- */
const docsModal = document.getElementById("docs-modal");
if (docsModal) {
  const docsBtn = document.getElementById("docs-btn");
  const docsClose = document.getElementById("docs-close");

  if (docsBtn) docsBtn.addEventListener("click", () => docsModal.showModal());
  if (docsClose) docsClose.addEventListener("click", () => docsModal.close());
}

let isDarkModePreview = false;

function toggleDarkModePreview() {
  isDarkModePreview = !isDarkModePreview;
  const btn = document.getElementById("toggle-dark-mode-btn");

  if (btn) {
    if (isDarkModePreview) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }

  applyDarkModeToIframe();
}

function applyDarkModeToIframe() {
  const iframe = document.getElementById("html-preview");
  if (!iframe) return;

  if (isDarkModePreview) {
    iframe.classList.add("ios-dark-mode");

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc && iframeDoc.head) {
      let darkStyle = iframeDoc.getElementById("ios-dark-mode-style");
      if (!darkStyle) {
        darkStyle = iframeDoc.createElement("style");
        darkStyle.id = "ios-dark-mode-style";
        iframeDoc.head.appendChild(darkStyle);
      }

      darkStyle.textContent = `
        img, [style*="background-image"] {
          filter: brightness(89%) contrast(122%) hue-rotate(180deg) invert(100%) !important;
        }
      `;
    }
  } else {
    iframe.classList.remove("ios-dark-mode");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
      const darkStyle = iframeDoc.getElementById("ios-dark-mode-style");
      if (darkStyle) darkStyle.remove();
    }
  }
}

const originalUpdateOutput = updateOutput;
updateOutput = function () {
  originalUpdateOutput();
  setTimeout(applyDarkModeToIframe, 50);
};

async function copyRenderedHTML() {
  if (!generatedHTML) return;

  try {
    let cleanHTML = generatedHTML;
    const bodyMatch = generatedHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      cleanHTML = bodyMatch[1].trim();
    }

    const htmlBlob = new Blob([cleanHTML], { type: "text/html" });
    const textBlob = new Blob([cleanHTML], { type: "text/plain" });

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      }),
    ]);

    const btn =
      document.getElementById("copy-rendered-btn") ||
      document.getElementById("copy-btn");
    if (btn) {
      btn.classList.add("is-copied");
      setTimeout(() => btn.classList.remove("is-copied"), 2000);
    }
  } catch (err) {
    console.error("Failed to copy rendered GUI: ", err);
  }
}

function copyRawHTML() {
  if (!generatedHTML) return;

  navigator.clipboard
    .writeText(generatedHTML)
    .then(() => {
      const btn = document.getElementById("copy-code-btn");
      if (btn) {
        btn.classList.add("is-copied");
        setTimeout(() => btn.classList.remove("is-copied"), 2000);
      }
    })
    .catch((err) => {
      console.error("Failed to copy raw HTML: ", err);
    });
}

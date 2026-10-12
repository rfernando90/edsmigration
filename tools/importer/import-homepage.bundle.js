/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel.js
  function resolveImage(container, document2) {
    if (!container) return null;
    let img = container.querySelector("img");
    if (!img) {
      const ns = container.querySelector("noscript");
      if (ns) {
        const tmp = document2.createElement("div");
        tmp.innerHTML = ns.textContent || ns.innerHTML;
        img = tmp.querySelector("img");
      }
    }
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-cmp-src]");
      let real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || holder && holder.getAttribute("data-cmp-src") || "";
      if (!real) {
        const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
        real = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
      }
      if (real) img.setAttribute("src", real.replace("{.width}", ".1600"));
    }
    return img;
  }
  function parse(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".cmp-carousel__item")];
    if (!slides.length) slides = [...element.querySelectorAll(".cmp-teaser")];
    const cells = [];
    slides.forEach((slide) => {
      const img = resolveImage(slide.querySelector(".cmp-teaser__image, .cmp-image") || slide, document2);
      const heading = slide.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = slide.querySelector(".cmp-teaser__description");
      const ctas = [...slide.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link")].filter((a, i, arr) => arr.indexOf(a) === i);
      const content = [];
      if (heading) {
        const h = document2.createElement("h2");
        h.textContent = heading.textContent.trim();
        content.push(h);
      }
      if (description) {
        if (description.querySelector("p")) {
          content.push(...description.querySelectorAll("p"));
        } else if (description.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = description.textContent.trim();
          content.push(p);
        }
      }
      ctas.forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        content.push(p);
      });
      if (!img && !content.length) return;
      cells.push([img || "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-featured.js
  function resolveImage2(container, document2) {
    if (!container) return null;
    let img = container.querySelector("img");
    if (!img) {
      const ns = container.querySelector("noscript");
      if (ns) {
        const tmp = document2.createElement("div");
        tmp.innerHTML = ns.textContent || ns.innerHTML;
        img = tmp.querySelector("img");
      }
    }
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-cmp-src]");
      let real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || holder && holder.getAttribute("data-cmp-src") || "";
      if (!real) {
        const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
        real = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
      }
      if (real) img.setAttribute("src", real.replace("{.width}", ".1600"));
    }
    return img;
  }
  function parse2(element, { document: document2 }) {
    const img = resolveImage2(element.querySelector(".cmp-teaser__image, .cmp-image"), document2);
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    const description = element.querySelector(".cmp-teaser__description");
    const ctas = [...element.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link")].filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !description && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const content = [];
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      content.push(p);
    }
    if (heading) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      content.push(h);
    }
    if (description) {
      if (description.querySelector("p")) {
        content.push(...description.querySelectorAll("p"));
      } else if (description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        content.push(p);
      }
    }
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      content.push(p);
    });
    const cells = [[img || "", content.length ? content : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function resolveImage3(container, document2) {
    if (!container) return null;
    let img = container.querySelector("img");
    if (!img) {
      const ns = container.querySelector("noscript");
      if (ns) {
        const tmp = document2.createElement("div");
        tmp.innerHTML = ns.textContent || ns.innerHTML;
        img = tmp.querySelector("img");
      }
    }
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-cmp-src]");
      let real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || holder && holder.getAttribute("data-cmp-src") || "";
      if (!real) {
        const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
        real = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
      }
      if (real) img.setAttribute("src", real.replace("{.width}", ".1600"));
    }
    return img;
  }
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll("li.cmp-image-list__item")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-image-list__item-content")];
    if (!items.length) items = [...element.querySelectorAll(":scope ul > li")];
    const cells = [];
    items.forEach((item) => {
      var _a;
      const img = resolveImage3(item.querySelector(".cmp-image-list__item-image, .cmp-image") || item, document2);
      const titleEl = item.querySelector(".cmp-image-list__item-title");
      const titleLink = item.querySelector("a.cmp-image-list__item-title-link") || titleEl && titleEl.closest("a") || item.querySelector("a[href]");
      const descEl = item.querySelector(".cmp-image-list__item-description");
      const titleText = ((_a = titleEl || titleLink) == null ? void 0 : _a.textContent.trim()) || "";
      const content = [];
      if (titleText) {
        const h = document2.createElement("h3");
        const href = titleLink && titleLink.getAttribute("href");
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          h.append(a);
        } else {
          h.textContent = titleText;
        }
        content.push(h);
      }
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descEl.textContent.trim();
        content.push(p);
      }
      if (!img && !content.length) return;
      cells.push([img || "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero.js
  function resolveImage4(container, document2) {
    if (!container) return null;
    let img = container.querySelector("img");
    if (!img) {
      const ns = container.querySelector("noscript");
      if (ns) {
        const tmp = document2.createElement("div");
        tmp.innerHTML = ns.textContent || ns.innerHTML;
        img = tmp.querySelector("img");
      }
    }
    if (!img) return null;
    const src = img.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) {
      const holder = img.closest("[data-cmp-src]");
      let real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || holder && holder.getAttribute("data-cmp-src") || "";
      if (!real) {
        const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
        real = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
      }
      if (real) img.setAttribute("src", real.replace("{.width}", ".1600"));
    }
    return img;
  }
  function parse4(element, { document: document2 }) {
    const img = resolveImage4(element.querySelector(".cmp-teaser__image, .cmp-image"), document2);
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    const description = element.querySelector(".cmp-teaser__description");
    const ctas = [...element.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link")].filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !description && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const content = [];
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      content.push(p);
    }
    if (heading) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      content.push(h);
    }
    if (description) {
      if (description.querySelector("p")) {
        content.push(...description.querySelectorAll("p"));
      } else if (description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        content.push(p);
      }
    }
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      content.push(p);
    });
    const cells = [];
    if (img) cells.push([img]);
    cells.push([content.length ? content : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SOURCE_HOST_RE = /^https?:\/\/publish-p123750-e1339057\.adobeaemcloud\.com(?=[/?#]|$)/i;
  function rewriteHref(href) {
    if (!href) return null;
    const raw = href.trim();
    if (!raw || raw.startsWith("#")) return null;
    let rest;
    if (SOURCE_HOST_RE.test(raw)) {
      rest = raw.replace(SOURCE_HOST_RE, "") || "/";
    } else if (raw.startsWith("/") && !raw.startsWith("//")) {
      rest = raw;
    } else {
      return null;
    }
    const m = rest.match(/^([^?#]*)(.*)$/);
    let path = m[1] || "/";
    const suffix = m[2] || "";
    if (path.startsWith("/etc.clientlibs")) return null;
    path = path.replace(/^\/content\/wknd(?=\/|$)/, "") || "/";
    const localeHome = path.match(/^\/([^/]+)\/([^/]+)\.html$/);
    if (localeHome) {
      path = `/${localeHome[1]}/${localeHome[2]}/`;
    } else if (/\.html$/.test(path)) {
      path = path.replace(/\.html$/, "");
    }
    return `${path}${suffix}`;
  }
  function fixAssetUrl(src) {
    if (!src) return null;
    const raw = src.trim();
    let rest;
    if (SOURCE_HOST_RE.test(raw)) {
      rest = raw.replace(SOURCE_HOST_RE, "");
    } else if (raw.startsWith("/") && !raw.startsWith("//")) {
      rest = raw;
    } else {
      return null;
    }
    if (!/^\/[a-z]{2}\/[a-z]{2}(?=[/.])/.test(rest)) return null;
    return `/content/wknd${rest}`;
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll("img").forEach((img) => {
        ["src", "data-src", "data-cmp-src"].forEach((attr) => {
          const next = fixAssetUrl(img.getAttribute(attr));
          if (next !== null) img.setAttribute(attr, next);
        });
        const srcset = img.getAttribute("srcset");
        if (srcset) {
          img.setAttribute("srcset", srcset.split(",").map((part) => {
            const [u, ...d] = part.trim().split(/\s+/);
            return [fixAssetUrl(u) || u, ...d].join(" ");
          }).join(", "));
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".cmp-carousel__actions",
        ".cmp-carousel__indicators"
      ]);
      WebImporter.DOMUtils.remove(element, ["script", "style", "noscript", "link"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        // header XF
        "footer.experiencefragment",
        // footer XF
        "#toggleNav",
        // mobile nav toggle
        "#mobileNav",
        // mobile nav
        ".sign-in-buttons",
        // sign-in / sign-out buttons
        ".languagenavigation",
        // language navigation
        "iframe",
        "source",
        "meta"
      ]);
      WebImporter.DOMUtils.remove(element, [".cmp-layout-container--fixed .separator:last-child"]);
      element.querySelectorAll("a[href]").forEach((a) => {
        const next = rewriteHref(a.getAttribute("href"));
        if (next !== null) a.setAttribute("href", next);
      });
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("data-cmp-") || attr.name === "onclick") {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        const prev = sectionEl.previousElementSibling;
        if (i > 0 && prev && prev.matches("div.separator") && prev.querySelector("hr.cmp-separator__horizontal-rule")) {
          prev.replaceWith(hr);
        } else {
          sectionEl.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    carousel: parse,
    "columns-featured": parse2,
    cards: parse3,
    hero: parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Landing page with hero carousel, featured teasers, card grids and promotional content sections",
    urls: [
      "https://publish-p123750-e1339057.adobeaemcloud.com/content/wknd/us/en.html"
    ],
    blocks: [
      { name: "carousel", instances: [".carousel.cmp-carousel--hero"] },
      { name: "columns-featured", instances: [".teaser.cmp-teaser--featured"] },
      { name: "cards", instances: [".image-list.list"] },
      { name: "hero", instances: [".teaser.cmp-teaser--hero.cmp-teaser--imagebottom"] }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero carousel",
        selector: [".carousel.cmp-carousel--hero"],
        style: null,
        blocks: ["carousel"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Featured article",
        selector: [".teaser.cmp-teaser--featured"],
        style: null,
        blocks: ["columns-featured"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Recent articles",
        selector: [".teaser.cmp-teaser--featured + .title.cmp-title--underline"],
        style: null,
        blocks: ["cards"],
        defaultContent: [
          ".teaser.cmp-teaser--featured + .title .cmp-title__text",
          ".teaser.cmp-teaser--featured ~ .button.cmp-button--primary"
        ]
      },
      {
        id: "section-4",
        name: "Next adventures promo",
        selector: [".separator + .title.cmp-title--underline"],
        style: null,
        blocks: ["hero"],
        defaultContent: [".separator + .title.cmp-title--underline .cmp-title__text"]
      },
      {
        id: "section-5",
        name: "Where do you want to go",
        selector: [".teaser.cmp-teaser--imagebottom + .container.cmp-layout-container--fixed"],
        style: null,
        blocks: ["cards"],
        defaultContent: [
          ".teaser.cmp-teaser--imagebottom + .container .cmp-title__text",
          ".teaser.cmp-teaser--imagebottom + .container .button.cmp-button--primary"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function toDocumentPath(originalURL) {
    let p = new URL(originalURL).pathname.replace(/^\/content\/wknd(?=\/|$)/, "").replace(/\/$/, "");
    const localeHome = p.match(/^\/([^/]+)\/([^/]+)\.html?$/);
    if (localeHome) {
      p = `/${localeHome[1]}/${localeHome[2]}/index`;
    } else {
      p = p.replace(/\.html?$/, "");
    }
    return p === "" ? "/index" : p;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(toDocumentPath(params.originalURL));
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();

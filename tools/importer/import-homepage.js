/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselParser from './parsers/carousel.js';
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  carousel: carouselParser,
  'columns-featured': columnsFeaturedParser,
  cards: cardsParser,
  hero: heroParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Landing page with hero carousel, featured teasers, card grids and promotional content sections',
  urls: [
    'https://publish-p123750-e1339057.adobeaemcloud.com/content/wknd/us/en.html',
  ],
  blocks: [
    { name: 'carousel', instances: ['.carousel.cmp-carousel--hero'] },
    { name: 'columns-featured', instances: ['.teaser.cmp-teaser--featured'] },
    { name: 'cards', instances: ['.image-list.list'] },
    { name: 'hero', instances: ['.teaser.cmp-teaser--hero.cmp-teaser--imagebottom'] },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero carousel',
      selector: ['.carousel.cmp-carousel--hero'],
      style: null,
      blocks: ['carousel'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Featured article',
      selector: ['.teaser.cmp-teaser--featured'],
      style: null,
      blocks: ['columns-featured'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Recent articles',
      selector: ['.teaser.cmp-teaser--featured + .title.cmp-title--underline'],
      style: null,
      blocks: ['cards'],
      defaultContent: [
        '.teaser.cmp-teaser--featured + .title .cmp-title__text',
        '.teaser.cmp-teaser--featured ~ .button.cmp-button--primary',
      ],
    },
    {
      id: 'section-4',
      name: 'Next adventures promo',
      selector: ['.separator + .title.cmp-title--underline'],
      style: null,
      blocks: ['hero'],
      defaultContent: ['.separator + .title.cmp-title--underline .cmp-title__text'],
    },
    {
      id: 'section-5',
      name: 'Where do you want to go',
      selector: ['.teaser.cmp-teaser--imagebottom + .container.cmp-layout-container--fixed'],
      style: null,
      blocks: ['cards'],
      defaultContent: [
        '.teaser.cmp-teaser--imagebottom + .container .cmp-title__text',
        '.teaser.cmp-teaser--imagebottom + .container .button.cmp-button--primary',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks (only when 2+ sections)
const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Map a source URL to the EDS document path, keeping the locale structure.
 * Strips the /content/wknd prefix and the .html extension; a locale home
 * page (e.g. /us/en.html) becomes the index document of that locale folder.
 * @param {string} originalURL - Source page URL
 * @returns {string} Document path without extension
 */
function toDocumentPath(originalURL) {
  let p = new URL(originalURL).pathname
    .replace(/^\/content\/wknd(?=\/|$)/, '')
    .replace(/\/$/, '');
  const localeHome = p.match(/^\/([^/]+)\/([^/]+)\.html?$/);
  if (localeHome) {
    p = `/${localeHome[1]}/${localeHome[2]}/index`;
  } else {
    p = p.replace(/\.html?$/, '');
  }
  return p === '' ? '/index' : p;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks while section elements still exist)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup, link rewriting)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized document path
    const path = WebImporter.FileUtils.sanitizePath(toDocumentPath(params.originalURL));

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

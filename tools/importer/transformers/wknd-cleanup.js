/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND (AEM core components) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const SOURCE_HOST_RE = /^https?:\/\/publish-p123750-e1339057\.adobeaemcloud\.com(?=[/?#]|$)/i;

/**
 * Rewrite a same-host link to the EDS path structure (keeps locale structure).
 * Returns null when the href should be left untouched.
 */
function rewriteHref(href) {
  if (!href) return null;
  const raw = href.trim();
  if (!raw || raw.startsWith('#')) return null;

  let rest;
  if (SOURCE_HOST_RE.test(raw)) {
    rest = raw.replace(SOURCE_HOST_RE, '') || '/';
  } else if (raw.startsWith('/') && !raw.startsWith('//')) {
    rest = raw;
  } else {
    return null; // external, protocol-relative, mailto:, tel:, etc.
  }

  const m = rest.match(/^([^?#]*)(.*)$/);
  let path = m[1] || '/';
  const suffix = m[2] || '';

  if (path.startsWith('/etc.clientlibs')) return null;

  // Strip leading /content/wknd prefix
  path = path.replace(/^\/content\/wknd(?=\/|$)/, '') || '/';

  const localeHome = path.match(/^\/([^/]+)\/([^/]+)\.html$/);
  if (localeHome) {
    path = `/${localeHome[1]}/${localeHome[2]}/`;
  } else if (/\.html$/.test(path)) {
    path = path.replace(/\.html$/, '');
  }

  return `${path}${suffix}`;
}

/**
 * Restore the /content/wknd prefix on shortened locale asset paths
 * (e.g. /us/en/_jcr_content/...coreimg.jpeg). The publish tier has no
 * resource mapping, so the short paths 404 and images would be lost.
 * Returns null when the URL should be left untouched.
 */
function fixAssetUrl(src) {
  if (!src) return null;
  const raw = src.trim();
  let rest;
  if (SOURCE_HOST_RE.test(raw)) {
    rest = raw.replace(SOURCE_HOST_RE, '');
  } else if (raw.startsWith('/') && !raw.startsWith('//')) {
    rest = raw;
  } else {
    return null;
  }
  if (!/^\/[a-z]{2}\/[a-z]{2}(?=[/.])/.test(rest)) return null;
  return `/content/wknd${rest}`;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Image URLs - fix before parsers copy the src into block cells
    element.querySelectorAll('img').forEach((img) => {
      ['src', 'data-src', 'data-cmp-src'].forEach((attr) => {
        const next = fixAssetUrl(img.getAttribute(attr));
        if (next !== null) img.setAttribute(attr, next);
      });
      const srcset = img.getAttribute('srcset');
      if (srcset) {
        img.setAttribute('srcset', srcset.split(',').map((part) => {
          const [u, ...d] = part.trim().split(/\s+/);
          return [fixAssetUrl(u) || u, ...d].join(' ');
        }).join(', '));
      }
    });

    // Carousel controls (found in .cmp-carousel) - non-authorable, would pollute carousel parsing
    WebImporter.DOMUtils.remove(element, [
      '.cmp-carousel__actions',
      '.cmp-carousel__indicators',
    ]);
    // Non-content elements
    WebImporter.DOMUtils.remove(element, ['script', 'style', 'noscript', 'link']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome (found in cleaned.html)
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment', // header XF
      'footer.experiencefragment', // footer XF
      '#toggleNav', // mobile nav toggle
      '#mobileNav', // mobile nav
      '.sign-in-buttons', // sign-in / sign-out buttons
      '.languagenavigation', // language navigation
      'iframe',
      'source',
      'meta',
    ]);

    // Trailing separator (after "All Trips") - would create an empty section at page end
    WebImporter.DOMUtils.remove(element, ['.cmp-layout-container--fixed .separator:last-child']);

    // CTAs (teaser action links, core-component buttons) -> bold links, which the
    // EDS boilerplate decorates as primary buttons. Parsers move these anchors as-is.
    element.querySelectorAll('a.cmp-teaser__action-link, a.cmp-button').forEach((a) => {
      if (a.closest('strong')) return;
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });

    // Internal link rewriting (same-host / root-relative only; img src untouched)
    element.querySelectorAll('a[href]').forEach((a) => {
      const next = rewriteHref(a.getAttribute('href'));
      if (next !== null) a.setAttribute('href', next);
    });

    // Attribute cleanup (data-cmp-* tracking/data-layer attributes)
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-cmp-') || attr.name === 'onclick') {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}

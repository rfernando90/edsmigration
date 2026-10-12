/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards. Base: cards.
 * Source: https://publish-p123750-e1339057.adobeaemcloud.com/content/wknd/us/en.html
 * Source selector: .image-list.list (AEM core image list) - 2 instances on the homepage
 * Output: 2 columns, one row per card: [image | h3 title link, description]
 * Validated selectors (migration-work/block-context/cards/source.html + instances/01.html):
 *   li.cmp-image-list__item, article.cmp-image-list__item-content,
 *   .cmp-image-list__item-image img, a.cmp-image-list__item-title-link,
 *   .cmp-image-list__item-title, .cmp-image-list__item-description
 * Iteration is keyed on the block-level <li>/<article> wrappers, never on the sibling
 * image/title anchors (same href, adjacent - candidates for html2md inline merging).
 * Generated: 2026-10-12
 */

/** Resolve lazy-loaded image sources (data-src / data-cmp-src / srcset / noscript). */
function resolveImage(container, document) {
  if (!container) return null;
  let img = container.querySelector('img');
  if (!img) {
    const ns = container.querySelector('noscript');
    if (ns) {
      const tmp = document.createElement('div');
      tmp.innerHTML = ns.textContent || ns.innerHTML;
      img = tmp.querySelector('img');
    }
  }
  if (!img) return null;
  const src = img.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) {
    const holder = img.closest('[data-cmp-src]');
    let real = img.getAttribute('data-src') || img.getAttribute('data-lazy-src')
      || (holder && holder.getAttribute('data-cmp-src')) || '';
    if (!real) {
      const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
      real = srcset.split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || '';
    }
    if (real) img.setAttribute('src', real.replace('{.width}', '.1600'));
  }
  return img;
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('li.cmp-image-list__item')];
  if (!items.length) items = [...element.querySelectorAll('.cmp-image-list__item-content')];
  if (!items.length) items = [...element.querySelectorAll(':scope ul > li')];

  const cells = [];
  items.forEach((item) => {
    const img = resolveImage(item.querySelector('.cmp-image-list__item-image, .cmp-image') || item, document);
    const titleEl = item.querySelector('.cmp-image-list__item-title');
    const titleLink = item.querySelector('a.cmp-image-list__item-title-link')
      || (titleEl && titleEl.closest('a'))
      || item.querySelector('a[href]');
    const descEl = item.querySelector('.cmp-image-list__item-description');

    const titleText = (titleEl || titleLink)?.textContent.trim() || '';
    const content = [];
    if (titleText) {
      const h = document.createElement('h3');
      const href = titleLink && titleLink.getAttribute('href');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        h.append(a);
      } else {
        h.textContent = titleText;
      }
      content.push(h);
    }
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      content.push(p);
    }

    if (!img && !content.length) return;
    cells.push([img || '', content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}

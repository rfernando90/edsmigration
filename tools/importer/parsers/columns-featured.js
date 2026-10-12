/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://publish-p123750-e1339057.adobeaemcloud.com/content/wknd/us/en.html
 * Source selector: .teaser.cmp-teaser--featured (AEM core featured teaser)
 * Output: 1 row, 2 columns: [image | pretitle, h2 title, description, CTA]
 * Validated selectors (migration-work/block-context/columns-featured/source.html):
 *   .cmp-teaser__image img, p.cmp-teaser__pretitle, h2.cmp-teaser__title,
 *   .cmp-teaser__description, .cmp-teaser__action-container a.cmp-teaser__action-link
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
  const img = resolveImage(element.querySelector('.cmp-teaser__image, .cmp-image'), document);
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = element.querySelector('.cmp-teaser__description');
  const ctas = [...element.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link')]
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!heading && !description && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const content = [];
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    content.push(p);
  }
  if (heading) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.trim();
    content.push(h);
  }
  if (description) {
    if (description.querySelector('p')) {
      content.push(...description.querySelectorAll('p'));
    } else if (description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      content.push(p);
    }
  }
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  });

  const cells = [[img || '', content.length ? content : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}

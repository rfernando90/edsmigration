/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel. Base: carousel.
 * Source: https://publish-p123750-e1339057.adobeaemcloud.com/content/wknd/us/en.html
 * Source selector: .carousel.cmp-carousel--hero (AEM core carousel of hero teasers)
 * Output: 2 columns, one row per slide: [image | title, description, CTA]
 * Validated selectors (migration-work/block-context/carousel/source.html):
 *   .cmp-carousel__item, .cmp-teaser__image img, h2.cmp-teaser__title,
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
  // One slide per carousel item; fall back to teasers if the item wrapper is missing.
  let slides = [...element.querySelectorAll('.cmp-carousel__item')];
  if (!slides.length) slides = [...element.querySelectorAll('.cmp-teaser')];

  const cells = [];
  slides.forEach((slide) => {
    const img = resolveImage(slide.querySelector('.cmp-teaser__image, .cmp-image') || slide, document);
    const heading = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = slide.querySelector('.cmp-teaser__description');
    const ctas = [...slide.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link')]
      .filter((a, i, arr) => arr.indexOf(a) === i);

    const content = [];
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

    if (!img && !content.length) return;
    cells.push([img || '', content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
